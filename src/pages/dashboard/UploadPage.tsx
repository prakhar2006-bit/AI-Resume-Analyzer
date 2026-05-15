import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { formatFileSize } from '@/lib/utils'
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

export default function UploadPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const onDrop = useCallback((accepted: File[], rejected: File[]) => {
    setErrorMsg('')
    if (rejected.length > 0) {
      const r = rejected[0]
      if (r.errors[0]?.code === 'file-too-large') setErrorMsg('File exceeds 5MB limit.')
      else setErrorMsg('Only PDF files are accepted.')
      return
    }
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file || !user) return
    setStatus('uploading')
    setProgress(10)
    setErrorMsg('')

    try {
      console.log('🚀 Starting upload for file:', file.name)
      // 1. Upload to Supabase Storage
      const path = `${user.id}/${Date.now()}_${file.name}`
      const { data: uploadData, error: storageError } = await supabase.storage
        .from('resumes')
        .upload(path, file, { contentType: 'application/pdf', upsert: false })

      if (storageError) {
        console.error('❌ Supabase Storage Error:', storageError)
        throw new Error(`Upload failed: ${storageError.message}`)
      }
      
      console.log('✅ Upload successful:', uploadData)
      setProgress(30)

      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path)
      const fileUrl = urlData.publicUrl

      // 2. Save record
      console.log('📝 Saving resume record to database...')
      const { data: resumeRow, error: dbErr } = await supabase
        .from('resumes')
        .insert({ user_id: user.id, file_name: file.name, file_url: fileUrl, status: 'analyzing' })
        .select()
        .single()

      if (dbErr) {
        console.error('❌ Database Error:', dbErr)
        throw new Error(`Database error: ${dbErr.message}`)
      }
      
      console.log('✅ Record saved:', resumeRow)
      setProgress(50)
      setStatus('analyzing')

      // 3. Call analyze API
      console.log('🧠 Calling AI Analysis API...')
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('resume_id', resumeRow.id)
      formData.append('user_id', user.id)
      if (jobDescription.trim()) formData.append('job_description', jobDescription)

      const res = await fetch('/api/analyze-resume', { method: 'POST', body: formData })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }))
        console.error('❌ API Error:', err)
        throw new Error(err.error || 'Analysis failed')
      }

      const result = await res.json()
      console.log('✅ Analysis complete:', result)
      
      setProgress(100)
      setStatus('done')
      toast.success('Analysis complete!')

      setTimeout(() => navigate(`/dashboard/analysis/${result.analysis_id}`), 800)
    } catch (err: unknown) {
      console.error('💥 Upload Process Failed:', err)
      setStatus('error')
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setErrorMsg(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">Upload Your Resume</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Get an instant AI-powered ATS score and improvement tips</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-[#6366F1] bg-[#6366F1]/10 animate-pulse-border'
            : file
            ? 'border-[#10B981] bg-[#10B981]/5'
            : 'border-[#2A2A3A] hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5 animate-pulse-border'
        }`}
      >
        <input {...getInputProps()} id="resume-file-input" />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-semibold">{file.name}</p>
              <p className="text-[#94A3B8] text-sm">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle') }}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#EF4444] transition-colors"
            >
              <X style={{ width: 13, height: 13 }} /> Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/15 border border-[#6366F1]/25 flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#6366F1]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-semibold text-lg">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume'}
              </p>
              <p className="text-[#94A3B8] text-sm mt-1">or click to browse files</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#4A5568]">
              <span>PDF only</span>
              <span className="w-1 h-1 rounded-full bg-[#2A2A3A]" />
              <span>Max 5MB</span>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] text-sm">
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          {errorMsg}
        </div>
      )}

      {/* Optional job description */}
      <div className="card">
        <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
          Target Job Description <span className="text-[#4A5568] font-normal text-xs">(optional — improves matching accuracy)</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={4}
          className="input resize-none"
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Progress bar */}
      {(status === 'uploading' || status === 'analyzing') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>{status === 'uploading' ? 'Uploading PDF...' : 'Analyzing with Claude AI...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-[#2A2A3A] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366F1, #22D3EE)',
                boxShadow: '0 0 10px rgba(99,102,241,0.5)',
              }}
            />
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-sm">
          <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
          Analysis complete! Redirecting...
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || status === 'uploading' || status === 'analyzing' || status === 'done'}
        className="btn btn-primary w-full"
        style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
      >
        {status === 'uploading' || status === 'analyzing' ? (
          <><Loader2 className="w-4 h-4 animate-spin" />
            {status === 'uploading' ? 'Uploading...' : 'Analyzing with AI...'}
          </>
        ) : status === 'done' ? (
          <><CheckCircle2 className="w-4 h-4" /> Done!</>
        ) : (
          <><Upload style={{ width: 16, height: 16 }} /> Analyze Resume</>
        )}
      </button>

      <p className="text-center text-xs text-[#4A5568]">
        Your resume is processed securely and never shared with third parties.
      </p>
    </div>
  )
}
