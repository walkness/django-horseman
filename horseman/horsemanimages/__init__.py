def get_rendition_name(name, crop, width, height):
    return '{}_{}x{}{}'.format(name, width, height, '_crop' if crop else '')

def convert_size_to_renditions(name, size):
    width, height = size['size']
    renditions = [(name, (width, height, size['crop']))]
    for extra_width in size.get('extra_widths', []):
        extra_height = round(extra_width * (height / width))
        renditions.append((
            get_rendition_name(name, size.get('crop', False), extra_width, extra_height),
            (extra_width, extra_height, size['crop']),
        ))
    return renditions
