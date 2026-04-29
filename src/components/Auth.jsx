import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
const { useState } = React;
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                alert('Реєстрація успішна! Перевірте пошту (якщо увімкнено підтвердження) або спробуйте увійти.');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err) {
            setError(err.message || 'Сталася помилка при авторизації');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#de4c4a] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-100">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#202020]">
                        {isSignUp ? 'Створити акаунт' : 'Вітаємо знову!'}
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        {isSignUp ? 'Зареєструйтесь, щоб керувати справами' : 'Увійдіть у свій Todoist-клон'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-in slide-in-from-top-1">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#de4c4a] focus:outline-none transition-all text-sm font-medium"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Пароль
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#de4c4a] focus:outline-none transition-all text-sm font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#de4c4a] hover:bg-[#b03d3a] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />
                        )}
                        <span>{isSignUp ? 'Зареєструватися' : 'Увійти'}</span>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm font-bold text-[#de4c4a] hover:text-[#b03d3a] transition-colors"
                    >
                        {isSignUp ? 'Вже маєте акаунт? Увійдіть' : 'Ще немає акаунту? Реєстрація'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
