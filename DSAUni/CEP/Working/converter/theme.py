"""
Design System & Theme Constants (Dual Theme Support)
"""

class Theme:
    # ------------------
    # Color Palette: (Light, Dark) Tuples
    # ------------------
    
    # Backgrounds
    # Light: Pure White | Dark: Deep Obsidian (#111111)
    BG_MAIN = ("#FFFFFF", "#0B0C0E")
    
    # Light: Soft Gray (#F3F4F6) | Dark: Elevated Gray/Blue (#15171B)
    BG_CARD = ("#F9FAFB", "#15171B") 
    
    # Light: Interaction (#E5E7EB) | Dark: Interaction (#2A2E35)
    BG_HOVER = ("#F3F4F6", "#1F2937")
    
    # Accents
    # Light: Black/Charcoal | Dark: Electric Blue (#3B8ED0)
    # Using Blue for Dark mode gives it that 'Cyber/Pro' feel, while Black for Light mode feels 'Swiss/Modern'.
    ACCENT_PRIMARY = ("#111827", "#3B8ED0") 
    ACCENT_HOVER = ("#374151", "#36719F")
    
    # Text
    # Light: Black | Dark: White
    TEXT_PRIMARY = ("#111827", "#FFFFFF")
    TEXT_SECONDARY = ("#6B7280", "#9CA3AF") 
    TEXT_DISABLED = ("#9CA3AF", "#4B5563")
    
    # Borders
    BORDER_SUBTLE = ("#E5E7EB", "#2B303B")
    
    # Success/Error
    ACCENT_SUCCESS = ("#22C55E", "#2ECC71")
    
    # ------------------
    # Typography
    # ------------------
    FONT_FAMILY = "Segoe UI" 
    
    FONT_HEADER = (FONT_FAMILY, 28, "bold") 
    FONT_SUBHEADER = (FONT_FAMILY, 14, "bold")
    FONT_BODY = (FONT_FAMILY, 13)
    FONT_SMALL = (FONT_FAMILY, 11)
    
    # ------------------
    # Dimensions
    # ------------------
    CORNER_RADIUS = 20 
