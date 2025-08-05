export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
};