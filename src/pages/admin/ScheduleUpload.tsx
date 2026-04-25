import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { parseScheduleWithAI, detectConflicts } from '../../lib/groq/schedule-parser';
import type { ParsedEntry } from '../../lib/groq/schedule-parser';
import { supabase } from '../../lib/supabase/client';
import { getCourses, getClassrooms, getFacultyList } from '../../lib/services/db-service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Upload, Zap, CheckCircle2, AlertTriangle, X, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'upload' | 'preview' | 'saving' | 'done';

export default function ScheduleUpload() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('upload');
  const [rawText, setRawText] = useState('');
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [conflicts, setConflicts] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setRawText((e.target?.result as string) ?? '');
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const runAIParsing = async () => {
    if (!rawText.trim()) return toast.error('Paste or upload schedule data first');
    setParsing(true);
    try {
      const entries = await parseScheduleWithAI(rawText);
      setParsedEntries(entries);
      const conflictResult = await detectConflicts(entries);
      setConflicts(conflictResult);
      setStep('preview');
    } catch (err) {
      toast.error('AI parsing failed. Check your Groq API key and try again.');
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const confirmAndSave = async () => {
    if (!user?.id) return;
    setStep('saving');
    try {
      const [allCourses, allClassrooms, allFaculty] = await Promise.all([
        getCourses(), getClassrooms(), getFacultyList(),
      ]);

      const { data: timetable, error: ttError } = await supabase
        .from('timetables')
        .insert({
          name: `Uploaded — ${new Date().toLocaleDateString()}`,
          academic_year: new Date().getFullYear().toString(),
          semester: 'odd',
          status: 'draft',
          generated_by: user.id,
        })
        .select()
        .single();

      if (ttError || !timetable) throw new Error('Failed to create timetable record');

      const entryRows = parsedEntries.map((e) => {
        const course = allCourses.find((c: any) =>
          c.code?.toLowerCase() === e.courseCode?.toLowerCase() ||
          c.name?.toLowerCase().includes(e.courseName?.toLowerCase())
        );
        const classroom = allClassrooms.find((r: any) =>
          r.name?.toLowerCase().includes(e.roomName?.toLowerCase())
        );
        const faculty = allFaculty.find((f: any) =>
          `${f.first_name} ${f.last_name}`.toLowerCase().includes(e.facultyName?.toLowerCase())
        );

        return {
          timetable_id: timetable.id,
          course_id: course?.id ?? null,
          faculty_id: faculty?.id ?? null,
          classroom_id: classroom?.id ?? null,
          day_of_week: e.dayOfWeek,
          start_time: e.startTime,
          end_time: e.endTime,
          session_type: e.sessionType,
          student_group: e.studentGroup,
        };
      }).filter((r) => r.course_id);

      await supabase.from('timetable_entries').insert(entryRows);
      setStep('done');
      toast.success(`Saved ${entryRows.length} entries!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save schedule');
      setStep('preview');
    }
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Schedule</h1>
          <p className="text-slate-400 text-sm mt-1">Paste or upload a CSV/text file — Groq AI will parse it into the timetable.</p>
        </div>

        <div className="flex items-center gap-3">
          {(['upload', 'preview', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === s ? 'bg-blue-500 text-white' : i < ['upload','preview','done'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                {i + 1}
              </div>
              <span className={`text-sm capitalize ${step === s ? 'text-white' : 'text-slate-500'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition group"
            >
              <Upload size={32} className="mx-auto text-slate-500 group-hover:text-blue-400 transition mb-3" />
              {fileName ? (
                <p className="text-white font-medium flex items-center justify-center gap-2">
                  <FileText size={16} className="text-blue-400" /> {fileName}
                </p>
              ) : (
                <>
                  <p className="text-slate-300 font-medium">Drop a CSV or text file here</p>
                  <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv,.txt,.json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Or paste schedule text directly:</p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Monday 9:00-10:00 Data Structures CS201 Dr. Sharma Room A101 CSE-A Sem3 Lecture..."
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none font-mono"
              />
            </div>

            <button
              onClick={runAIParsing}
              disabled={parsing || !rawText.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {parsing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {parsing ? 'Groq is parsing...' : 'Parse with Groq AI'}
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {conflicts && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <p className="text-amber-400 font-semibold text-sm">Conflicts Detected</p>
                </div>
                <pre className="text-amber-200/70 text-xs overflow-x-auto">{conflicts}</pre>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <p className="text-white font-semibold">{parsedEntries.length} entries parsed</p>
                <button onClick={() => setStep('upload')} className="text-slate-400 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Day', 'Time', 'Course', 'Faculty', 'Room', 'Group', 'Type'].map((h) => (
                        <th key={h} className="text-left text-slate-400 text-xs font-semibold px-4 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedEntries.map((e, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-4 py-2 text-slate-300">{DAYS[e.dayOfWeek]}</td>
                        <td className="px-4 py-2 text-slate-300 whitespace-nowrap">{e.startTime}–{e.endTime}</td>
                        <td className="px-4 py-2 text-white font-medium">{e.courseName} <span className="text-slate-500 text-xs">({e.courseCode})</span></td>
                        <td className="px-4 py-2 text-slate-300">{e.facultyName}</td>
                        <td className="px-4 py-2 text-slate-300">{e.roomName}</td>
                        <td className="px-4 py-2 text-slate-300">{e.studentGroup}</td>
                        <td className="px-4 py-2"><span className="text-xs capitalize border border-white/10 text-slate-400 rounded px-2 py-0.5">{e.sessionType}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('upload')} className="px-4 py-2 text-slate-400 hover:text-white border border-white/10 rounded-lg text-sm transition">
                ← Back
              </button>
              <button
                onClick={confirmAndSave}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                <CheckCircle2 size={16} /> Confirm & Save to Database
              </button>
            </div>
          </div>
        )}

        {step === 'saving' && (
          <div className="flex flex-col items-center py-16 gap-4">
            <Loader2 size={40} className="text-blue-400 animate-spin" />
            <p className="text-white font-medium">Saving schedule to Supabase...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-16 gap-4">
            <CheckCircle2 size={48} className="text-emerald-400" />
            <p className="text-white text-xl font-bold">Schedule Saved!</p>
            <p className="text-slate-400 text-sm">The timetable has been saved as a draft. Go to Timetables to publish it.</p>
            <button onClick={() => { setStep('upload'); setRawText(''); setParsedEntries([]); setFileName(''); }} className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition">
              Upload another schedule →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
