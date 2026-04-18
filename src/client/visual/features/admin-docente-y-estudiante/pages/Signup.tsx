import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';
import AppLogo from '../../../common/components/AppLogo';

const STEPS = [
    { title: 'Datos personales', subtitle: 'Cuentanos sobre ti' },
    { title: 'Crear cuenta', subtitle: 'Configura tu acceso' },
];

const Signup = () => {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
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

    const goNext = () => {
        setLocalError('');
        if (!formData.primerNombre.trim() || !formData.primerApellido.trim() || !formData.segundoApellido.trim()) {
            setLocalError('Completa los campos obligatorios');
            return;
        }
        setDirection(1);
        setStep(1);
    };

    const goBack = () => {
        setLocalError('');
        setDirection(-1);
        setStep(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Las contrasenas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setLocalError('La contrasena debe tener al menos 6 caracteres');
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
                navigate('/seleccion-niveles');
            }, 400);
        }
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
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

                <div className={styles.stepHeader}>
                    <h1 className={styles.title}>{STEPS[step].title}</h1>
                    <p className={styles.subtitle}>{STEPS[step].subtitle}</p>
                </div>

                {/* Step indicators */}
                <div className={styles.stepIndicator}>
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''} ${i < step ? styles.stepDotDone : ''}`}
                        />
                    ))}
                </div>

                <form onSubmit={step === 1 ? handleSubmit : (e) => { e.preventDefault(); goNext(); }} className={styles.form}>
                    <AnimatePresence mode="wait" custom={direction}>
                        {step === 0 && (
                            <motion.div
                                key="step-0"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className={styles.stepContent}
                            >
                                <div className={styles.fieldSection}>
                                    <span className={styles.fieldLabel}>Nombre</span>
                                    <div className={styles.fieldRow}>
                                        <input
                                            type="text"
                                            name="primerNombre"
                                            value={formData.primerNombre}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="Primer nombre"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="segundoNombre"
                                            value={formData.segundoNombre}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="Segundo (opcional)"
                                        />
                                    </div>
                                </div>

                                <div className={styles.fieldSection}>
                                    <span className={styles.fieldLabel}>Apellido</span>
                                    <div className={styles.fieldRow}>
                                        <input
                                            type="text"
                                            name="primerApellido"
                                            value={formData.primerApellido}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="Primero"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="segundoApellido"
                                            value={formData.segundoApellido}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="Segundo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.fieldSection}>
                                    <span className={styles.fieldLabel}>Codigo unico</span>
                                    <input
                                        type="number"
                                        name="codigoUnico"
                                        value={formData.codigoUnico}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Ej. 20231001"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className={styles.stepContent}
                            >
                                <div className={styles.fieldSection}>
                                    <span className={styles.fieldLabel}>Correo electronico</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="usuario@epn.edu.ec"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldSection}>
                                    <span className={styles.fieldLabel}>Contrasena</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldSection}>
                                    <span className={styles.fieldLabel}>Confirmar contrasena</span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {(localError || error) && <div className={styles.error}>{localError || error}</div>}

                    <div className={styles.stepActions}>
                        <AnimatePresence initial={false}>
                            {step === 1 && (
                                <motion.button
                                    key="back-btn"
                                    type="button"
                                    className={styles.backButton}
                                    onClick={goBack}
                                    initial={{ width: 0, opacity: 0, marginRight: 0 }}
                                    animate={{ width: 44, opacity: 1, marginRight: 10 }}
                                    exit={{ width: 0, opacity: 0, marginRight: 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ overflow: 'hidden', boxSizing: 'border-box' }}
                                >
                                    <ArrowLeft size={18} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {step === 0 ? 'Continuar' : loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </div>
                </form>

                <div className={styles.footer}>
                    Ya tienes una cuenta? <Link to="/login" className={styles.link}>
                        Inicia sesion
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Signup;
