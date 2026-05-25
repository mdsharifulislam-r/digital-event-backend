export enum TRANSACTION_STATUS {
    PENDING = "Pending",
    PROCESSING = "Processing",
    COMPLETED = "Completed",
    FAILED = "Failed",
}


export enum TRANSACTION_TYPE {
    DEPOSIT = "Deposit",
    WITHDRAW = "Withdraw",
    TRANSFER = "Transfer",
    PAYMENT = "Payment",
    SUBSCRIPTION = "Subscription",
}

export enum TRANSACTION_PAYMENT_TYPE {
    DABIT = "Debit",
    CREDIT = "Credit",
}