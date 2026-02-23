import { useState } from 'react';
import { QrScanner } from '@/components/QrScanner';
import { Timer } from '@/components/Timer';
import axios from 'axios';
import { motion } from 'motion/react';
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ScanLine, 
  Gamepad2, 
  Trophy, 
  Clock, 
  Play, 
  StopCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Define the shape of our data
interface QuestionData {
  id: string;
  nomorSoal: string | number;
  pertanyaan: string;
  mediaDrive: string;
  mediaLainnya: string;
}

type AppState = 'IDLE' | 'SCANNING' | 'FETCHING' | 'DISPLAY_QUESTION' | 'UPDATING' | 'FINISHED';

export default function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [scannedId, setScannedId] = useState<string>('');
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');

  // Get the script URL from env
  const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  const handleScan = (decodedText: string) => {
    setScannedId(decodedText);
    fetchQuestion(decodedText);
  };

  const fetchQuestion = async (idOverride?: string) => {
    const idToUse = idOverride || scannedId || manualId;
    
    if (!idToUse) {
      setError('Yuk scan QR code atau masukkan ID dulu ya!');
      return;
    }

    if (!SCRIPT_URL) {
      setError('Waduh, URL server belum disetting nih.');
      return;
    }

    setState('FETCHING');
    setError(null);

    try {
      const response = await axios.get(SCRIPT_URL, {
        params: {
          action: 'get_question',
          id: idToUse
        }
      });

      const data = response.data;

      if (data.status === 'success') {
        setQuestionData(data.data);
        setState('DISPLAY_QUESTION');
      } else {
        setError(data.message || 'Yah, soalnya tidak ketemu. Coba lagi ya!');
        setState('IDLE');
      }
    } catch (err) {
      console.error(err);
      setError('Ada masalah koneksi nih. Cek internet kamu ya!');
      setState('IDLE');
    }
  };

  const handleTimerComplete = async () => {
    setState('UPDATING');
    
    if (!SCRIPT_URL || !questionData) return;

    try {
      const response = await axios.get(SCRIPT_URL, {
        params: {
          action: 'update_number',
          id: questionData.id
        }
      });

      if (response.data.status === 'success') {
        setState('FINISHED');
      } else {
        setError('Gagal ganti nomor soal: ' + response.data.message);
        setState('FINISHED');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server.');
      setState('FINISHED');
    }
  };

  const resetApp = () => {
    setState('IDLE');
    setScannedId('');
    setQuestionData(null);
    setError(null);
    setManualId('');
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-sans text-slate-800 pb-20 selection:bg-pink-200">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="fixed top-0 right-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-8 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-indigo-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <Gamepad2 className="w-8 h-8 text-indigo-600 fill-indigo-100" />
          <h1 className="text-2xl font-black text-indigo-600 tracking-tight text-center drop-shadow-sm">
            Monopoli <span className="text-pink-500">QUIRO</span>
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6 relative z-10">
        
        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 border-2 border-red-200 shadow-md"
          >
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="font-bold text-sm">{error}</p>
          </motion.div>
        )}

        {/* STATE: IDLE */}
        {state === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-100 text-center space-y-6 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg ring-4 ring-indigo-100">
                <ScanLine className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Siap Bermain?</h2>
                <p className="text-slate-500 font-medium">Ayo scan kartu QR Code kamu untuk mendapatkan tantangan seru!</p>
              </div>
              
              <button
                onClick={() => setState('SCANNING')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 text-lg border-b-4 border-indigo-800"
              >
                <ScanLine className="w-6 h-6" />
                Scan Barcode
              </button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-dashed border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm font-bold uppercase tracking-widest">
                <span className="bg-yellow-50 px-4 text-slate-400">Atau Manual</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-orange-100 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Masukkan ID Soal</label>
                <input
                  type="text"
                  placeholder="Contoh: A1, B2..."
                  value={manualId}
                  onChange={(e) => {
                    setManualId(e.target.value);
                    setScannedId(e.target.value);
                  }}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-bold text-lg text-center uppercase placeholder:normal-case"
                />
              </div>
              <button
                onClick={() => fetchQuestion()}
                disabled={!scannedId}
                className="w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md border-b-4 border-orange-600 active:scale-95 text-lg"
              >
                <Search className="w-6 h-6" />
                Cari Soal
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE: SCANNING */}
        {state === 'SCANNING' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-800">Kamera Aktif</h2>
                </div>
                <button 
                  onClick={() => setState('IDLE')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border-4 border-slate-900 shadow-inner">
                <QrScanner onScan={handleScan} />
              </div>
              <p className="text-center text-slate-500 mt-4 font-medium">Arahkan kamera ke kode QR</p>
            </div>
          </motion.div>
        )}

        {/* STATE: FETCHING */}
        {state === 'FETCHING' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-indigo-600">Sebentar ya...</h3>
              <p className="text-slate-500 font-medium">Sedang mengambil soal untukmu!</p>
            </div>
          </div>
        )}

        {/* STATE: DISPLAY_QUESTION */}
        {state === 'DISPLAY_QUESTION' && questionData && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl shadow-xl border-b-8 border-indigo-200 overflow-hidden transform transition-all">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                <div className="flex justify-between items-center text-white relative z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-lg tracking-wide">TANTANGAN</span>
                  </div>
                  <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-black backdrop-blur-md border border-white/30 shadow-sm">
                    #{questionData.nomorSoal}
                  </span>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Pertanyaan
                  </h3>
                  <p className="text-2xl text-slate-800 font-bold leading-relaxed">
                    {questionData.pertanyaan}
                  </p>
                </div>

                {(questionData.mediaDrive || questionData.mediaLainnya) && (
                  <div className="pt-6 border-t-2 border-dashed border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bantuan Media</h3>
                    <div className="grid gap-3">
                      {questionData.mediaDrive && (
                        <a 
                          href={questionData.mediaDrive} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 hover:scale-[1.02] transition-all border-2 border-blue-100"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Buka Media Drive
                        </a>
                      )}
                      {questionData.mediaLainnya && (
                        <a 
                          href={questionData.mediaLainnya} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 hover:scale-[1.02] transition-all border-2 border-emerald-100"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Buka Media Lainnya
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timer Section */}
            <div className="bg-white rounded-3xl shadow-xl border-b-8 border-pink-200 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"></div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-pink-500" />
                <h3 className="text-xl font-black text-slate-800">Waktu Menjawab</h3>
              </div>
              
              <Timer duration={40} onComplete={handleTimerComplete} />
              
              <p className="text-sm text-slate-400 font-medium mt-6 bg-slate-50 py-2 px-4 rounded-full inline-block">
                Soal akan diacak ulang otomatis saat waktu habis
              </p>
              
              <div className="mt-8 pt-6 border-t-2 border-slate-100">
                <button
                  onClick={handleTimerComplete}
                  className="w-full group bg-red-50 hover:bg-red-100 text-red-500 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 border-2 border-red-100 hover:border-red-200"
                >
                  <StopCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Menyerah / Akhiri Sekarang
                </button>
                <p className="text-xs text-slate-400 mt-3 font-medium">Klik tombol ini jika kamu tidak bisa menjawab</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE: UPDATING */}
        {state === 'UPDATING' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
            <div className="bg-white p-6 rounded-full shadow-xl mb-4 animate-bounce">
              <Clock className="w-16 h-16 text-pink-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Waktu Habis!</h3>
              <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold bg-indigo-50 py-2 px-4 rounded-full mx-auto w-fit">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengacak soal baru...</span>
              </div>
            </div>
          </div>
        )}

        {/* STATE: FINISHED */}
        {state === 'FINISHED' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8 py-10"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-yellow-200 rounded-full animate-ping opacity-50"></div>
              <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-400 mx-auto">
                <Trophy className="w-16 h-16 text-yellow-500 fill-yellow-200" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">SELESAI!</h2>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 inline-block">
                <p className="text-slate-600 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Nomor soal sudah diperbarui otomatis
                </p>
              </div>
            </div>

            <button
              onClick={resetApp}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-indigo-200 transform transition-all active:scale-95 flex items-center justify-center gap-3 text-xl border-b-4 border-indigo-800"
            >
              <RefreshCw className="w-6 h-6" />
              MAIN LAGI
            </button>
          </motion.div>
        )}

      </main>
      
      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50"></div>
    </div>
  );
}

// Helper component for the finished state icon
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
