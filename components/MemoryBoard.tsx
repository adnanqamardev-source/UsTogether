import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar, Sparkles, Loader, Upload, Trash2, Image as ImageIcon, Milestone as MilestoneIcon } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import Markdown from 'react-markdown';
import { uploadWithProgress, deletePhoto } from '@/lib/storage';
import type { MemoryPhoto, Milestone } from '../global.d';
import { doc } from 'firebase/firestore';

type Tab = 'memories' | 'photos' | 'milestones';

const toTimestamp = (value: any): number => {
  if (!value) return Date.now();
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
};

function getQuizTitle(s: any): string {
  return s.quizTitle || s.state?.quizTitle || 'Unknown Quiz';
}

function formatMemoryDate(ts: number | undefined): string {
  if (!ts) return 'Just now';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts));
}

export default function MemoryBoard({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('memories');
  const [finishedSessions, setFinishedSessions] = useState<any[]>([]);
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const fetchMemories = async () => {
    try {
      const qs = query(collection(db, `couples/${coupleId}/sessions`), where('status', '==', 'finished'));
      const sn = await getDocs(qs);
      const sessions = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      const validSessions = sessions.filter((s: any) => {
        const quizId = s.state?.quizId;
        if (!quizId) return false;
        const answers = s.state?.answers || {};
        return Object.keys(answers).length > 0;
      });
      setFinishedSessions(validSessions);
    } catch (e: any) {
      handleFirestoreError(e, OperationType.LIST, `couples/${coupleId}/sessions (Memories)`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const qs = query(collection(db, `couples/${coupleId}/memory_photos`), where('coupleId', '==', coupleId));
      const sn = await getDocs(qs);
      const items = sn.docs.map(d => ({ id: d.id, ...d.data() } as MemoryPhoto));
      setPhotos(items.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)));
    } catch (e: any) {
      handleFirestoreError(e, OperationType.LIST, `couples/${coupleId}/memory_photos`);
    }
  };

  const fetchMilestones = async () => {
    try {
      const qs = query(collection(db, `couples/${coupleId}/milestones`), where('coupleId', '==', coupleId));
      const sn = await getDocs(qs);
      const items = sn.docs.map(d => ({ id: d.id, ...d.data() } as Milestone));
      setMilestones(items.sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date)));
    } catch (e: any) {
      handleFirestoreError(e, OperationType.LIST, `couples/${coupleId}/milestones`);
    }
  };

  useEffect(() => {
    fetchMemories();
    fetchPhotos();
    fetchMilestones();
  }, [coupleId]);

  const generateChallenge = async () => {
    setGenerating(true);
    setChallenge(null);
    try {
      const token = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/generate-challenge', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          history: finishedSessions.map(s => ({ title: getQuizTitle(s), answers: s.state?.answers })),
        }),
      });
      const data = await res.json();
      if (data.challenge) {
        setChallenge(data.challenge);
      } else {
        alert("Failed to generate challenge: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setUploading(true);
    for (const file of files) {
      const path = `couples/${coupleId}/photos/${Date.now()}_${file.name}`;
      try {
        const downloadURL = await uploadWithProgress(file, path, (p) => {});
        const payload: any = {
          url: downloadURL,
          sessionId: activeSessionId || '',
          coupleId,
          uploadedBy: user.uid,
          uploadedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, `couples/${coupleId}/memory_photos`), payload);
      } catch (err) {
        console.error('Photo upload failed', err);
      }
    }
    setUploading(false);
    fetchPhotos();
  };

  const removePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    try {
      const refPath = new URL(photo.url).pathname.replace(/^\/o\//, '').split('?')[0];
      const decoded = decodeURIComponent(refPath);
      await deletePhoto(decoded);
      const docRef = doc(db, 'couples', coupleId, 'memory_photos', id);
      await deleteDoc(docRef);
      setPhotos(list => list.filter(p => p.id !== id));
    } catch (e) {
      console.error('Remove photo failed', e);
    }
  };

  if (loading) return <div className="text-indigo-200 text-center py-20 font-light animate-pulse">Loading memories...</div>;

  return (
    <div className="w-full pb-20">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
           <h1 className="text-4xl md:text-5xl font-serif italic mb-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">Memory Board</h1>
           <p className="text-indigo-200/60 font-light">Look back on your shared moments and answers.</p>
         </div>
         <button
           onClick={generateChallenge}
           disabled={generating}
           className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
         >
           {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
           <span>AI Challenge</span>
         </button>
      </header>

      {challenge && (
        <div className="mb-12 bg-indigo-500/10 border border-indigo-500/30 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
             <Sparkles className="w-20 h-20 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-serif italic text-indigo-300 mb-4 flex items-center gap-3">
             <Sparkles className="w-6 h-6" /> Your Custom Prompt
          </h2>
          <div className="prose prose-invert prose-indigo">
             <Markdown>{challenge}</Markdown>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setTab('memories')}
          className={`px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all border ${tab === 'memories' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
        >
          Memories
        </button>
        <button
          onClick={() => setTab('photos')}
          className={`px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all border ${tab === 'photos' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
        >
          Photos
        </button>
        <button
          onClick={() => setTab('milestones')}
          className={`px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all border ${tab === 'milestones' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
        >
          Milestones
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'memories' && (
          <motion.div
            key="memories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="columns-2 md:columns-3 gap-6 space-y-6"
          >
            {finishedSessions.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                 <div className="mx-auto mb-4 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center text-2xl">☕</div>
                 </div>
                 <p className="text-indigo-200/50">No chai-sipped quizzes yet — start one and make some memories.</p>
              </div>
            ) : (
              finishedSessions.map(s => (
                <motion.div
                  key={s.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-rose-500/0 group-hover:from-indigo-500/10 group-hover:to-rose-500/10 transition-all duration-500 pointer-events-none" />
                  <Calendar className="w-8 h-8 text-rose-400 mb-4 relative z-10" />
                  <h3 className="font-serif italic text-xl mb-2 text-[#F8FAFC] relative z-10">{getQuizTitle(s)}</h3>
                  <p className="text-xs text-indigo-300 uppercase tracking-widest relative z-10">{formatMemoryDate(s.updatedAt)}</p>
                  <button onClick={() => window.location.hash = `#session/${s.id}`} className="mt-6 uppercase text-xs tracking-widest text-indigo-200 hover:text-white transition-colors bg-indigo-500/20 px-6 py-2 rounded-full border border-indigo-500/30 relative z-10 group-hover:bg-indigo-500/40 group-hover:border-indigo-400/50">
                     View
                  </button>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        {tab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-slate-400">Shared photo memories</div>
              <button onClick={handleUploadClick} disabled={uploading} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50">
                <Upload className="w-4 h-4" /> Upload
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </div>
            {photos.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <ImageIcon className="w-10 h-10 text-indigo-300 mx-auto mb-4" />
                <p className="text-indigo-200/50">No photos yet. Upload your first memory.</p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 gap-6 space-y-6">
                {photos.map(p => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="group relative bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-lg"
                  >
                    <img src={p.url} alt="memory" className="w-full object-cover rounded-[2rem]" loading="lazy" />
                    <div className="p-4 flex items-center justify-between">
                      <div className="text-xs text-slate-400">{new Date(p.uploadedAt).toLocaleDateString()}</div>
                      <button onClick={() => removePhoto(p.id)} className="text-white/60 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {tab === 'milestones' && (
          <motion.div
            key="milestones"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {milestones.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <MilestoneIcon className="w-10 h-10 text-indigo-300 mx-auto mb-4" />
                <p className="text-indigo-200/50">No milestones yet. They appear when you hit special moments.</p>
              </div>
            ) : (
              milestones.map(m => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-start gap-4"
                >
                  <div className="text-2xl">{m.icon || '🏆'}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">{m.title}</p>
                    {m.description && <p className="text-indigo-200/60 text-sm">{m.description}</p>}
                    <p className="text-xs text-indigo-300 uppercase tracking-widest mt-2">{formatMemoryDate(m.date)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}