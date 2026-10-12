from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    # Let Django handle unexpected, unhandled exceptions.
    if response is None:
        return None

    data = response.data

    if isinstance(data, dict) and "detail" in data:
        detail = data["detail"]
        code = getattr(detail, "code", "request_error")
        message = str(detail)
        details = None
    elif isinstance(exc, ValidationError):
        code = "validation_error"
        message = "Validation failed."
        details = data
    else:
        code = "request_error"
        message = "The request could not be processed."
        details = data

    response.data = {
        "success": False,
        "error": {
            "code": str(code),
            "message": message,
            "details": details,
        },
    }

    return response

