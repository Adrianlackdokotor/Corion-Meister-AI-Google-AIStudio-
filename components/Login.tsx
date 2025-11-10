import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAG+CAYAAABVVl3fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGAAAP+lSURBVHhe7J0FnFRF1sf7l5CAJCRkIYSQhAwhhEAEBEFFVFDEgoCiIBZFRERBQRQVUREEFEFAECggISQhJJCQhExI+v/3zN7d7OzuzO7s7EhyPvd5Pp+cnZmdnZ3Z2Zmd7713Zmd2d0IIoYqjiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqgiiqg-n-";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            onLogin(email);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 font-sans text-gray-100 p-4">
            <div className="text-center w-full max-w-sm mx-auto">
                <img src={logoBase64} alt="Corion Logo" className="h-24 w-auto mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-red-500">Corion-Meister </span>
                    <span className="text-white">AI</span>
                </h1>
                <p className="text-gray-400 mb-8">Willkommen zurück, Meister-Anwärter. Bitte loggen Sie sich ein, um Ihr Training fortzusetzen.</p>
                
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 text-left mb-2">
                                E-Mail-Adresse
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ihre.email@beispiel.com"
                                required
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors"
                            disabled={!email.trim()}
                        >
                            Login
                        </button>
                    </form>
                </div>
                 <p className="mt-8 text-xs text-gray-500">Powered by Gemini</p>
            </div>
        </div>
    );
};

export default Login;