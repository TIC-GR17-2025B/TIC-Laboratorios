import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await login({
            correo_electronico: email,
            contrasenia: password,
        });

        if (result?.success && result.data) {
            setIsExiting(true);
            const destination = result.data.role === 'profesor' 
                ? '/docente' 
                : '/seleccion-niveles';
            
            setTimeout(() => {
                navigate(destination);
            }, 700);
        }
    };

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                delay: isExiting ? 0.4 : 0
            }}
        >
            <motion.div
                className={styles.leftPanel}
                initial={{ opacity: 1, y: 0 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    y: isExiting ? 50 : 0
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className={styles.logo}>
                    TIC
                </div>

                <div className={styles.authCard}>
                    <h1 className={styles.title}>Iniciar Sesión</h1>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Correo electrónico
                            </label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="usuario@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Contraseña
                            </label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Ingrese Contraseña"
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        ¿No tienes una cuenta? <Link to="/signup" className={styles.link}>
                            Regístrate
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div></div>
            </motion.div>

            <motion.div
                className={styles.rightPanel}
                initial={{ x: 0 }}
                animate={{ x: isExiting ? "100%" : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className={styles.heroContent}>
                    <p className={styles.heroText}>
                        Una nueva forma de experimentar la seguridad de redes en el espacio virtual.
                    </p>
                </div>
                <div className={styles.geometricShape}></div>
            </motion.div>
        </motion.div>
    );
};

export default Login;
