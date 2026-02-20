import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Get client IP address
    const clientIp = 
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        (req.headers["x-real-ip"] as string) ||
        req.socket.remoteAddress ||
        "unknown";

    // Log request start
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url} - IP: ${clientIp}`);

    // Capture response finish event
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? "ERROR" : "INFO";
        
        // eslint-disable-next-line no-console
        console.log(
            `[${new Date().toISOString()}] ${logLevel} ${req.method} ${req.originalUrl || req.url} ` +
            `${res.statusCode} - ${duration}ms - IP: ${clientIp}`
        );
    });

    next();
}
