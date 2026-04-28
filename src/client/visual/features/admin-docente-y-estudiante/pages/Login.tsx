import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';
import AppLogo from '../../../common/components/AppLogo';

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
            const destination = result.data.confirmado
                ? (result.data.role === 'profesor' ? '/docente' : '/seleccion-niveles')
                : '/verificar-email';

            setTimeout(() => {
                navigate(destination);
            }, 400);
        }
    };

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
                delay: isExiting ? 0.15 : 0
            }}
        >
            <motion.div
                className={styles.authCard}
                initial={{ opacity: 1, y: 0 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    y: isExiting ? 20 : 0
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className={styles.logoIcon}>
                    <AppLogo size={48} />
                </div>

                <h1 className={styles.title} style={{ marginBottom: 28 }}>Iniciar Sesion</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.srOnly}>Correo electrónico</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="Correo electronico"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.srOnly}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Contrasena"
                            required
                        />
                    </div>

                    {error && <div className={styles.error} role="alert" aria-live="assertive">{error}</div>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
                    </button>
                </form>

                <div className={styles.footer}>
                    No tienes una cuenta? <Link to="/signup" className={styles.link}>
                        Registrate
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Login;
