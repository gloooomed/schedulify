import { askGroq } from './client';

const SYSTEM = `You are a college timetable expert. Parse the provided schedule data (CSV, JSON, or plain text) 
and return a valid JSON array of timetable entries. Each entry must have:
{ courseCode, courseName, facultyName, dayOfWeek (0=Sun,1=Mon..6=Sat), 
  startTime (HH:MM), endTime (HH:MM), roomName, sessionType (lecture|lab|tutorial), 
  studentGroup, semester }
Return ONLY the JSON array, no explanation.`;

export interface ParsedEntry {
  courseCode: string;
  courseName: string;
  facultyName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomName: string;
  sessionType: 'lecture' | 'lab' | 'tutorial';
  studentGroup: string;
  semester: number;
}

export async function parseScheduleWithAI(rawText: string): Promise<ParsedEntry[]> {
  const response = await askGroq(SYSTEM, rawText);
  const cleaned = response.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as ParsedEntry[];
}

export async function detectConflicts(entries: ParsedEntry[]): Promise<string> {
  const prompt = `Analyse these timetable entries for conflicts (same faculty/room double-booked, 
student group clashes). Return a concise JSON array of conflicts: 
[{ type, description, affectedEntries, severity }].
Entries: ${JSON.stringify(entries)}`;
  return askGroq('You are a scheduling conflict detector. Return only JSON.', prompt);
}
