import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { KeyRound } from 'lucide-react';

const Login = () => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handlePinEntry = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const clearPin = () => setPin('');

  const submitPin = async () => {
    try {
      const data = await loginUser(pin);
      localStorage.setItem('riva_token', data.token);
      localStorage.setItem('riva_user', JSON.stringify(data.user));
      navigate('/tables');
    } catch (err) {
      alert(err.response?.data?.error || 'Errore di autenticazione');
      clearPin();
    }
  };

  return (
    <div className="flex bg-[#8B0000] min-h-screen text-white flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-[#D4AF37] mb-2">RIVA BEACH</h1>
        <p className="text-xl opacity-80 tracking-widest uppercase">Management System</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 w-full max-w-sm">
        <h2 className="text-2xl text-center mb-6">Inserisci PIN Cameriere</h2>
        
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
             <div key={i} className={`w-6 h-6 rounded-full border-2 ${pin.length > i ? 'bg-white border-white' : 'border-white/50'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => handlePinEntry(num.toString())} className="h-16 rounded-xl bg-white/5 hover:bg-white/20 text-2xl font-semibold transition">
              {num}
            </button>
          ))}
          <button onClick={clearPin} className="h-16 rounded-xl bg-white/5 hover:bg-white/20 text-xl font-semibold transition text-red-300">
            CANC
          </button>
          <button onClick={() => handlePinEntry('0')} className="h-16 rounded-xl bg-white/5 hover:bg-white/20 text-2xl font-semibold transition">
            0
          </button>
          <button onClick={submitPin} className="h-16 rounded-xl bg-[#D4AF37] hover:bg-[#b8952f] text-[#1A1A1A] font-bold text-xl transition">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
