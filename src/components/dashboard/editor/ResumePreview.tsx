import { ResumeData } from '@/lib/types'

interface Props {
  data: ResumeData
}

export function ResumePreview({ data }: Props) {
  const { contact, summary, experience, education, skills, template } = data

  const renderClassic = () => (
    <div className="flex flex-col gap-6 text-black font-serif">
      <div className="text-center border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-tight">{contact.name || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </div>

      {summary && (
        <div>
          <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Professional Summary</h2>
          <p className="text-[11px] leading-relaxed text-gray-700">{summary}</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Work Experience</h2>
        <div className="space-y-4">
          {experience.map((exp: any) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs">{exp.role || 'Role Title'}</span>
                <span className="text-[10px] italic">{exp.dates || 'Dates'}</span>
              </div>
              <div className="italic text-[11px]">{exp.company || 'Company Name'}</div>
              <p className="text-[10px] mt-1 text-gray-600 whitespace-pre-wrap">{exp.description || 'Description of your achievements...'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderModern = () => (
    <div className="flex flex-col gap-8 text-slate-800 font-sans">
      <div className="bg-slate-800 -mx-12 -mt-12 p-12 text-white">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{contact.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm opacity-80">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {summary && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-slate-800 pl-3 mb-4">About Me</h2>
              <p className="text-sm leading-relaxed text-slate-600">{summary}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-slate-800 pl-3 mb-4">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp: any) => (
                <div key={exp.id} className="relative pl-4 border-l border-slate-200">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400" />
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-base text-slate-900">{exp.role || 'Role Title'}</span>
                    <span className="text-xs font-semibold text-slate-500">{exp.dates || 'Dates'}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 mb-2">{exp.company || 'Company Name'}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-slate-800 pl-3 mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills?.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMinimal = () => (
    <div className="flex flex-col gap-10 text-gray-900 font-sans max-w-[500px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-5xl font-light tracking-tighter text-black">{contact.name || 'Your Name'}</h1>
        <div className="flex gap-4 text-[10px] uppercase tracking-widest text-gray-400">
          <span>{contact.email}</span>
          <span>{contact.location}</span>
        </div>
      </div>

      {summary && (
        <p className="text-sm leading-relaxed font-light text-gray-600 border-l border-gray-100 pl-6 italic">
          {summary}
        </p>
      )}

      <div className="space-y-8">
        {experience.map((exp: any) => (
          <div key={exp.id} className="grid grid-cols-4 gap-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 pt-1">
              {exp.dates || 'Dates'}
            </div>
            <div className="col-span-3 space-y-1">
              <h3 className="font-bold text-sm">{exp.role}</h3>
              <p className="text-xs text-gray-500">{exp.company}</p>
              <p className="text-xs text-gray-600 leading-relaxed mt-2">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white w-full max-w-[595px] min-h-[842px] p-12 shadow-2xl overflow-hidden" id="resume-preview">
      {template === 'classic' && renderClassic()}
      {template === 'modern' && renderModern()}
      {template === 'minimal' && renderMinimal()}
    </div>
  )
}
