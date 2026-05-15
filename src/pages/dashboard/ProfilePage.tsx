import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { generateAvatarInitials } from '@/lib/utils'
import { Camera, Plus, X, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, profile, fetchProfile } = useAuthStore()
  const [form, setForm] = useState({
    full_name: '', linkedin_url: '', github_url: '',
    target_role: '', target_industry: '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        target_role: profile.target_role || '',
        target_industry: profile.target_industry || '',
      })
      setSkills(profile.skills || [])
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...form, skills, avatar_url: avatarUrl })
    setSaving(false)
    if (error) { toast.error(error.message) }
    else {
      toast.success('Profile updated!')
      await fetchProfile(user.id)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    const path = `${user.id}/avatar.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { toast.error(error.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setUploadingAvatar(false)
    toast.success('Avatar updated!')
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput('') }
  }

  const handleDelete = async () => {
    if (!user) return
    await supabase.auth.admin.deleteUser(user.id).catch(() => {})
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#F1F5F9]">My Profile</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Personalize your account and preferences</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-20 h-20 object-cover" />
              : generateAvatarInitials(form.full_name || 'U')
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6366F1] flex items-center justify-center text-white hover:bg-[#4F46E5] transition-colors"
          >
            {uploadingAvatar ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Camera style={{ width: 12, height: 12 }} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-semibold text-[#F1F5F9]">{form.full_name || 'Your Name'}</p>
          <p className="text-sm text-[#94A3B8]">{user?.email}</p>
          <p className="text-xs text-[#4A5568] mt-1">Click the camera icon to upload a photo</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" placeholder="Alex Johnson" />
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">Email (read-only)</label>
            <input value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">Target Role</label>
            <input value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} className="input" placeholder="Senior Frontend Engineer" />
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">Target Industry</label>
            <input value={form.target_industry} onChange={(e) => setForm({ ...form, target_industry: e.target.value })} className="input" placeholder="Technology, Finance..." />
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">LinkedIn URL</label>
            <input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className="input" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">GitHub URL</label>
            <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className="input" placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-[#F1F5F9]">Skills</h2>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="input flex-1"
            placeholder="Add a skill and press Enter..."
          />
          <button onClick={addSkill} className="btn btn-secondary">
            <Plus style={{ width: 14, height: 14 }} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="tag flex items-center gap-1.5">
              {s}
              <button onClick={() => setSkills(skills.filter((sk) => sk !== s))}>
                <X style={{ width: 11, height: 11 }} />
              </button>
            </span>
          ))}
          {skills.length === 0 && <p className="text-xs text-[#4A5568]">No skills added yet</p>}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Profile'}
      </button>

      {/* Danger zone */}
      <div className="card border-[#EF4444]/20" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <h2 className="text-sm font-semibold text-[#EF4444] mb-3 flex items-center gap-2">
          <AlertTriangle style={{ width: 15, height: 15 }} /> Danger Zone
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#F1F5F9]">Delete Account</p>
            <p className="text-xs text-[#94A3B8]">Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger text-xs flex-shrink-0">
            <Trash2 style={{ width: 13, height: 13 }} /> Delete
          </button>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full" style={{ padding: '1.5rem' }}>
            <AlertTriangle className="w-8 h-8 text-[#EF4444] mb-3" />
            <h3 className="text-lg font-heading font-bold text-[#F1F5F9] mb-2">Delete your account?</h3>
            <p className="text-sm text-[#94A3B8] mb-5">This will permanently delete all your resumes, analyses, and saved jobs. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn btn-danger flex-1">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
