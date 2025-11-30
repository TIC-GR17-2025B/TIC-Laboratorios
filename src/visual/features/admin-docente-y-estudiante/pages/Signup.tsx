import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';

const Signup = () => {
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        codigoUnico: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();
    const { registerEstudiante, loading, error } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const result = await registerEstudiante({
            primernombre: formData.primerNombre,
            segundo_nombre: formData.segundoNombre,
            primer_apellido: formData.primerApellido,
            segundo_apellido: formData.segundoApellido,
            codigo_unico: parseInt(formData.codigoUnico),
            correo_electronico: formData.email,
            contrasenia: formData.password,
        });

        if (result?.success) {
            setIsExiting(true);
            setTimeout(() => {
                navigate('/login');
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
                    <h1 className={styles.title}>Registrarse</h1>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="primerNombre" className={styles.label}>
                                    Primer Nombre
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="primerNombre"
                                        name="primerNombre"
                                        value={formData.primerNombre}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Juan"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="segundoNombre" className={styles.label}>
                                    Segundo Nombre
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="segundoNombre"
                                        name="segundoNombre"
                                        value={formData.segundoNombre}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Carlos"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="primerApellido" className={styles.label}>
                                    Primer Apellido
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="primerApellido"
                                        name="primerApellido"
                                        value={formData.primerApellido}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Pérez"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="segundoApellido" className={styles.label}>
                                    Segundo Apellido
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="segundoApellido"
                                        name="segundoApellido"
                                        value={formData.segundoApellido}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="González"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="codigoUnico" className={styles.label}>
                                Código Único
                            </label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                    </svg>
                                </span>
                                <input
                                    type="number"
                                    id="codigoUnico"
                                    name="codigoUnico"
                                    value={formData.codigoUnico}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="12345678"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Correo Electrónico
                            </label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Ingrese Contraseña"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Confirmar Contraseña
                            </label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Confirmar Contraseña"
                                    required
                                />
                            </div>
                        </div>

                        {(localError || error) && <div className={styles.error}>{localError || error}</div>}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        ¿Ya tienes una cuenta? <Link to="/login" className={styles.link}>
                            Inicia sesión
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
                        Una nueva forma de experimentar la seguridad de redes en el espacio virtual
                    </p>
                </div>
                <div className={styles.geometricShape}></div>
            </motion.div>
        </motion.div>
    );
};

export default Signup;
