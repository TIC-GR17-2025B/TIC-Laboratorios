import type { ReactNode } from 'react';
import { FirewallLogsProvider } from './FirewallLogsContext';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';

interface FirewallLogsProviderWrapperProps {
    children: ReactNode;
}

/**
 * Wrapper que conecta el FirewallLogsProvider con el ECSManager del contexto
 */
export const FirewallLogsProviderWrapper: React.FC<FirewallLogsProviderWrapperProps> = ({ children }) => {
    const { ecsManager } = useECSSceneContext();
    
    return (
        <FirewallLogsProvider ecsManager={ecsManager}>
            {children}
        </FirewallLogsProvider>
    );
};
