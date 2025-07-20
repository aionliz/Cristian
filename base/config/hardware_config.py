# base/config/hardware_config.py
"""
Configuración para dispositivos de hardware biométrico.
Personalice según su lector de huellas específico.
"""

import os
from typing import Dict, Any

# =====================================================
# CONFIGURACIÓN GENERAL
# =====================================================

HARDWARE_CONFIG = {
    # Lector preferido (cambiar según su hardware)
    'default_reader': 'zkteco',  # Opciones: 'zkteco', 'opencv', 'suprema', 'digitalpersona'
    
    # Umbral de calidad mínima (0-100)
    'quality_threshold': 70,
    
    # Timeout para captura (segundos)
    'capture_timeout': 30,
    
    # Máximo intentos de captura
    'max_capture_attempts': 3,
    
    # Habilitar logs detallados
    'debug_mode': True,
}

# =====================================================
# CONFIGURACIÓN ESPECÍFICA POR FABRICANTE
# =====================================================

# ZKTeco (Muy común en Chile y Latinoamérica)
ZKTECO_CONFIG = {
    'port': 'AUTO',  # AUTO para detección automática, o especificar COM3, /dev/ttyUSB0, etc.
    'baudrate': 115200,
    'timeout': 5,
    'databits': 8,
    'parity': 'N',
    'stopbits': 1,
    'models': [
        'ZK4500',   # USB
        'ZK6500',   # USB
        'ZK9500',   # USB/Serial
        'Live20R',  # USB
        'SLK20R',   # USB
    ]
}

# Suprema (Coreanos, muy buenos)
SUPREMA_CONFIG = {
    'device_id': 1,
    'port': 'AUTO',
    'timeout': 10,
    'models': [
        'BioEntry',
        'BioLite',
        'RealScan',
    ]
}

# DigitalPersona (Americanos)
DIGITALPERSONA_CONFIG = {
    'device_type': 'U.are.U 4500',
    'capture_priority': 'DP_PRIORITY_COOPERATIVE',
    'models': [
        'U.are.U 4500',
        'U.are.U 5300',
        'U.are.U 5160',
    ]
}

# OpenCV/Cámara (Fallback genérico)
OPENCV_CONFIG = {
    'camera_index': 0,  # 0 = cámara principal, 1 = segunda cámara, etc.
    'resolution_width': 640,
    'resolution_height': 480,
    'capture_fps': 30,
    'preprocessing': {
        'gaussian_blur': True,
        'clahe_enhancement': True,
        'gabor_filter': True,
        'adaptive_threshold': True,
    }
}

# =====================================================
# CONFIGURACIÓN PARA PRODUCCIÓN
# =====================================================

# Configuración para ambiente de producción
PRODUCTION_CONFIG = {
    'reader_type': os.getenv('FINGERPRINT_READER_TYPE', 'zkteco'),
    'device_port': os.getenv('FINGERPRINT_DEVICE_PORT', 'AUTO'),
    'quality_threshold': int(os.getenv('FINGERPRINT_QUALITY_THRESHOLD', '80')),
    'enable_encryption': True,
    'log_level': 'INFO',
    'backup_templates': True,
}

# =====================================================
# CONFIGURACIÓN PARA DESARROLLO/TESTING
# =====================================================

DEVELOPMENT_CONFIG = {
    'reader_type': 'opencv',  # Más fácil para desarrollo
    'simulate_hardware': True,
    'quality_threshold': 60,  # Más permisivo para pruebas
    'log_level': 'DEBUG',
    'save_debug_images': True,
}

# =====================================================
# CONFIGURACIÓN AVANZADA
# =====================================================

ADVANCED_CONFIG = {
    # Algoritmos de matching
    'matching_algorithm': 'minutiae',  # 'minutiae', 'pattern', 'ridge'
    'matching_threshold': 0.75,        # 0.0 - 1.0
    
    # Optimizaciones de rendimiento
    'enable_parallel_processing': True,
    'max_worker_threads': 4,
    'memory_cache_size': 100,  # MB
    
    # Seguridad
    'encrypt_templates': True,
    'hash_algorithm': 'SHA256',
    'template_compression': True,
    
    # Base de datos
    'batch_insert_size': 50,
    'connection_pool_size': 10,
    'query_timeout': 30,
}

# =====================================================
# MAPEO DE DISPOSITIVOS COMUNES EN CHILE
# =====================================================

CHILE_COMMON_DEVICES = {
    # Dispositivos más vendidos en Chile
    'zkteco_live20r': {
        'type': 'zkteco',
        'model': 'Live20R',
        'connection': 'USB',
        'price_range': 'Económico',
        'recommended': True,
    },
    'zkteco_slk20r': {
        'type': 'zkteco',
        'model': 'SLK20R',
        'connection': 'USB',
        'price_range': 'Económico',
        'recommended': True,
    },
    'suprema_bioentry': {
        'type': 'suprema',
        'model': 'BioEntry Plus 2',
        'connection': 'TCP/IP',
        'price_range': 'Premium',
        'recommended': False,  # Más caro
    },
    'nitgen_fingkey': {
        'type': 'nitgen',
        'model': 'FingerKey Hamster',
        'connection': 'USB',
        'price_range': 'Medio',
        'recommended': True,
    }
}

# =====================================================
# FUNCIONES AUXILIARES
# =====================================================

def get_config_for_environment(env: str = 'development') -> Dict[str, Any]:
    """
    Obtener configuración según el ambiente.
    
    Args:
        env: 'development', 'production', 'testing'
    
    Returns:
        Dict con configuración específica
    """
    base_config = HARDWARE_CONFIG.copy()
    
    if env == 'production':
        base_config.update(PRODUCTION_CONFIG)
    elif env == 'development':
        base_config.update(DEVELOPMENT_CONFIG)
    
    # Agregar configuración específica del lector
    reader_type = base_config.get('default_reader', 'zkteco')
    
    if reader_type == 'zkteco':
        base_config['device_config'] = ZKTECO_CONFIG
    elif reader_type == 'suprema':
        base_config['device_config'] = SUPREMA_CONFIG
    elif reader_type == 'digitalpersona':
        base_config['device_config'] = DIGITALPERSONA_CONFIG
    elif reader_type == 'opencv':
        base_config['device_config'] = OPENCV_CONFIG
    
    return base_config

def get_recommended_device_for_budget(budget: str = 'economico') -> Dict[str, Any]:
    """
    Recomendar dispositivo según presupuesto.
    
    Args:
        budget: 'economico', 'medio', 'premium'
    
    Returns:
        Dict con información del dispositivo recomendado
    """
    budget_map = {
        'economico': 'Económico',
        'medio': 'Medio', 
        'premium': 'Premium'
    }
    
    target_range = budget_map.get(budget, 'Económico')
    
    for device_id, device_info in CHILE_COMMON_DEVICES.items():
        if (device_info['price_range'] == target_range and 
            device_info.get('recommended', False)):
            return device_info
    
    # Fallback al más económico recomendado
    for device_id, device_info in CHILE_COMMON_DEVICES.items():
        if device_info.get('recommended', False):
            return device_info
    
    return {}

def validate_hardware_config(config: Dict[str, Any]) -> bool:
    """
    Validar configuración de hardware.
    
    Args:
        config: Diccionario de configuración
    
    Returns:
        True si la configuración es válida
    """
    required_keys = ['default_reader', 'quality_threshold', 'capture_timeout']
    
    for key in required_keys:
        if key not in config:
            print(f"Error: Falta configuración requerida: {key}")
            return False
    
    # Validar valores
    if not (0 <= config['quality_threshold'] <= 100):
        print("Error: quality_threshold debe estar entre 0 y 100")
        return False
    
    if config['capture_timeout'] <= 0:
        print("Error: capture_timeout debe ser mayor a 0")
        return False
    
    return True

# =====================================================
# CONFIGURACIÓN POR DEFECTO PARA LA APLICACIÓN
# =====================================================

# Esta es la configuración que usará la aplicación
# Modifique según su hardware específico
DEFAULT_APP_CONFIG = get_config_for_environment('development')

# Para producción, cambie a:
# DEFAULT_APP_CONFIG = get_config_for_environment('production')

if __name__ == "__main__":
    # Test de configuración
    print("=== Configuración de Hardware ===")
    print(f"Ambiente: development")
    print(f"Configuración: {DEFAULT_APP_CONFIG}")
    print()
    
    print("=== Dispositivos Recomendados ===")
    print(f"Económico: {get_recommended_device_for_budget('economico')}")
    print(f"Medio: {get_recommended_device_for_budget('medio')}")
    print(f"Premium: {get_recommended_device_for_budget('premium')}")
    print()
    
    print(f"Configuración válida: {validate_hardware_config(DEFAULT_APP_CONFIG)}")
