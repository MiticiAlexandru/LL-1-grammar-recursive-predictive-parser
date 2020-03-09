class CustomSyntaxError extends Error {
    constructor(errorMessage) {
        super(errorMessage);
        this.message = errorMessage;
    }
}

export default CustomSyntaxError;
