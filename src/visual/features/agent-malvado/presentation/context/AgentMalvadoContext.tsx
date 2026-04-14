import { createContext, useContext, useState, type ReactNode } from 'react';
import { GenerateScenarioUseCase } from '../../application/useCases/GenerateScenarioUseCase';
import { ScenarioBuilderApiService } from '../../infrastructure/services/ScenarioBuilderApiService';

interface AgentMalvadoContextProps {
  isGenerating: boolean;
  generatedScenario: Record<string, unknown> | null;
  error: string | null;
  generateDynamicLevel: (prompt?: string) => Promise<void>;
  clearScenario: () => void;
}

const AgentMalvadoContext = createContext<AgentMalvadoContextProps | undefined>(undefined);

export const AgentMalvadoProvider = ({ children }: { children: ReactNode }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenario, setGeneratedScenario] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDynamicLevel = async (customPrompt?: string) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedScenario(null);

    try {
      const apiService = new ScenarioBuilderApiService();
      const useCase = new GenerateScenarioUseCase(apiService);
      const result = await useCase.execute({ prompt: customPrompt });

      if (result.success && result.data) {
        setGeneratedScenario(result.data[0] || result.data); // Assuming array format for ECS
      } else {
        setError(result.error || 'Fallo desconocido de la IA malvada');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor ECS');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearScenario = () => {
    setGeneratedScenario(null);
    setError(null);
  };

  return (
    <AgentMalvadoContext.Provider value={{ isGenerating, generatedScenario, error, generateDynamicLevel, clearScenario }}>
      {children}
    </AgentMalvadoContext.Provider>
  );
};

export const useAgentMalvado = (): AgentMalvadoContextProps => {
  const context = useContext(AgentMalvadoContext);
  if (!context) {
    throw new Error('useAgentMalvado debe usarse dentro de un AgentMalvadoProvider');
  }
  return context;
};
