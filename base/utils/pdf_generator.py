from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
from datetime import datetime
import os


class PDFGenerator:
    """
    Generador de PDFs para reportes de asistencia.
    """

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.custom_styles = self._create_custom_styles()

    def _create_custom_styles(self):
        """Crea estilos personalizados para el PDF."""
        custom_styles = {}

        # Estilo para título principal
        custom_styles['titulo'] = ParagraphStyle(
            'titulo',
            parent=self.styles['Title'],
            fontSize=18,
            spaceAfter=20,
            alignment=1,  # Centro
            textColor=colors.darkblue
        )

        # Estilo para subtítulos
        custom_styles['subtitulo'] = ParagraphStyle(
            'subtitulo',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue
        )

        # Estilo para texto normal
        custom_styles['normal'] = ParagraphStyle(
            'normal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )

        return custom_styles

    def generar_reporte_asistencia(self, datos_reporte, nombre_archivo=None):
        """
        Genera un PDF del reporte de asistencia.

        Args:
            datos_reporte (dict): Datos del reporte generados por AsistenciaModel
            nombre_archivo (str): Nombre del archivo (opcional)

        Returns:
            BytesIO: Buffer con el contenido del PDF
        """
        if not nombre_archivo:
            fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
            nombre_archivo = f"reporte_asistencia_{fecha_actual}.pdf"

        # Crear buffer para el PDF
        buffer = BytesIO()

        # Crear documento
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )

        # Lista de elementos del documento
        elementos = []

        # Título del reporte
        parametros = datos_reporte.get('parametros', {})
        mes = parametros.get('mes', 'N/A')
        titulo = f"Reporte de Asistencia - {mes}"
        elementos.append(Paragraph(titulo, self.custom_styles['titulo']))
        elementos.append(Spacer(1, 20))

        # Información general
        fecha_generacion = datetime.now().strftime("%d/%m/%Y %H:%M")
        info_general = f"<b>Fecha de generación:</b> {fecha_generacion}<br/>"
        info_general += f"<b>Período:</b> {parametros.get('fecha_inicio', '')} - {parametros.get('fecha_fin', '')}<br/>"
        if parametros.get('curso'):
            info_general += f"<b>Curso:</b> {parametros.get('curso', '')}<br/>"

        elementos.append(Paragraph(info_general, self.custom_styles['normal']))
        elementos.append(Spacer(1, 20))

        # Resumen estadístico
        resumen = datos_reporte.get('resumen', {})
        elementos.append(Paragraph("Resumen Estadístico",
                         self.custom_styles['subtitulo']))

        # Tabla de resumen
        datos_resumen = [
            ['Concepto', 'Cantidad', 'Porcentaje'],
            ['Presente', str(resumen.get('total_presente', 0)),
             f"{(resumen.get('total_presente', 0) / max(resumen.get('total_registros', 1), 1) * 100):.1f}%"],
            ['Ausente', str(resumen.get('total_ausente', 0)),
             f"{(resumen.get('total_ausente', 0) / max(resumen.get('total_registros', 1), 1) * 100):.1f}%"],
            ['Tardanza', str(resumen.get('total_tarde', 0)),
             f"{(resumen.get('total_tarde', 0) / max(resumen.get('total_registros', 1), 1) * 100):.1f}%"],
            ['Justificado', str(resumen.get('total_justificado', 0)),
             f"{(resumen.get('total_justificado', 0) / max(resumen.get('total_registros', 1), 1) * 100):.1f}%"],
            ['Total Registros', str(resumen.get('total_registros', 0)), '100%']
        ]

        tabla_resumen = Table(datos_resumen, colWidths=[
                              2*inch, 1*inch, 1*inch])
        tabla_resumen.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elementos.append(tabla_resumen)
        elementos.append(Spacer(1, 20))

        # Detalle por alumno
        alumnos = datos_reporte.get('alumnos', [])
        if alumnos:
            elementos.append(Paragraph("Detalle por Alumno",
                             self.custom_styles['subtitulo']))

            # Encabezados de la tabla
            datos_alumnos = [
                ['Nombre', 'Curso', 'Presente', 'Ausente',
                    'Tarde', 'Just.', '% Asist.', 'Estado']
            ]

            # Agregar datos de cada alumno
            for alumno in alumnos:
                fila = [
                    alumno.get('nombre_completo', '')[:30],  # Limitar longitud
                    alumno.get('curso', ''),
                    str(alumno.get('dias_presente', 0)),
                    str(alumno.get('dias_ausente', 0)),
                    str(alumno.get('dias_tarde', 0)),
                    str(alumno.get('dias_justificado', 0)),
                    f"{alumno.get('porcentaje_asistencia', 0):.1f}%",
                    alumno.get('estado', '')
                ]
                datos_alumnos.append(fila)

            # Crear tabla de alumnos
            tabla_alumnos = Table(datos_alumnos, colWidths=[
                2.5*inch, 0.7*inch, 0.6*inch, 0.6*inch,
                0.6*inch, 0.6*inch, 0.7*inch, 0.8*inch
            ])

            tabla_alumnos.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('FONTSIZE', (0, 1), (-1, -1), 7),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))

            # Colorear filas según estado
            for i, alumno in enumerate(alumnos, 1):
                estado = alumno.get('estado', '')
                if estado == 'Crítico':
                    tabla_alumnos.setStyle(TableStyle([
                        ('BACKGROUND', (0, i), (-1, i), colors.lightcoral)
                    ]))
                elif estado == 'Regular':
                    tabla_alumnos.setStyle(TableStyle([
                        ('BACKGROUND', (0, i), (-1, i), colors.lightyellow)
                    ]))
                elif estado == 'Excelente':
                    tabla_alumnos.setStyle(TableStyle([
                        ('BACKGROUND', (0, i), (-1, i), colors.lightgreen)
                    ]))

            elementos.append(tabla_alumnos)

        # Información adicional
        elementos.append(Spacer(1, 30))
        info_adicional = """
        <b>Leyenda de Estados:</b><br/>
        • Excelente: ≥ 85% de asistencia<br/>
        • Bueno: 75% - 84% de asistencia<br/>
        • Regular: 65% - 74% de asistencia<br/>
        • Crítico: < 65% de asistencia<br/>
        """
        elementos.append(
            Paragraph(info_adicional, self.custom_styles['normal']))

        # Construir PDF
        doc.build(elementos)

        # Posicionar al inicio del buffer
        buffer.seek(0)

        return buffer

    def generar_reporte_simple(self, titulo, contenido):
        """
        Genera un PDF simple con título y contenido.

        Args:
            titulo (str): Título del documento
            contenido (str): Contenido del documento

        Returns:
            BytesIO: Buffer con el contenido del PDF
        """
        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elementos = []

        # Título
        elementos.append(Paragraph(titulo, self.custom_styles['titulo']))
        elementos.append(Spacer(1, 20))

        # Contenido
        elementos.append(Paragraph(contenido, self.custom_styles['normal']))

        # Construir PDF
        doc.build(elementos)
        buffer.seek(0)

        return buffer


# Instancia global del generador
pdf_generator = PDFGenerator()


def generar_pdf_reporte(datos_reporte, nombre_archivo=None):
    """
    Función de conveniencia para generar PDFs de reportes.
    """
    return pdf_generator.generar_reporte_asistencia(datos_reporte, nombre_archivo)
