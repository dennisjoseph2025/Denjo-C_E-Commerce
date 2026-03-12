import re

def custom_postprocessing_hook(result, generator, request, public):

    # Groups endpoints into tags based on their URL paths.

    paths = result.get('paths', {})
    for path, methods in paths.items():
        tag = None
        
        # Determine tag based on URI path
        if path.startswith('/auth/'):
            tag = 'auth'
        elif path.startswith('/api/products/'):
            tag = 'products'
        elif path.startswith('/api/cart/'):
            tag = 'cart'
        elif path.startswith('/api/order/'):
            tag = 'order'
        elif path.startswith('/api/admin/stats/'):
            tag = 'admin'
        elif path.startswith('/api/admin/'):
            tag = 'admin'
        
        if tag:
            for method, operation in methods.items():
                if isinstance(operation, dict):
                    operation['tags'] = [tag]
                    
    return result
