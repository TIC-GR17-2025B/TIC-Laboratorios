import type { JSX } from 'react';
import { LogCategory } from '../../../../types/LogCategory';

import CarritoIcon from '../../../common/icons/CarritoIcon';
import AdvertenciaIcon from '../../../common/icons/AdvertenciaIcon';
import ConfiguracionVisto from '../../../common/icons/ConfiguracionVisto';

export function obtenerColorCategoria(category: LogCategory): string {
    switch (category) {
        case LogCategory.ATAQUE:
            return "#D4474A";
        case LogCategory.COMPRA:
            return "#C084FC";
        case LogCategory.INFO:
            return "#52AB7B";
        case LogCategory.ADVERTENCIA:
            return "#F59E0B";
        default:
            return "#787878";
    }
}

export function obtenerIconoCategoria(category: LogCategory): JSX.Element {
    switch (category) {
        case LogCategory.ATAQUE:
            return (<AdvertenciaIcon size={16} />);
        case LogCategory.COMPRA:
            return (<CarritoIcon size={16} />);
        case LogCategory.INFO:
            return (<ConfiguracionVisto size={16} />);
        case LogCategory.ADVERTENCIA:
            return (<AdvertenciaIcon size={16} />);
        default:
            return (<CarritoIcon size={16} />);
    }
}

