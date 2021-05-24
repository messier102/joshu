export type CommandResponse =
    | { kind: "empty" }
    | { kind: "send"; message: string }
    | { kind: "reply"; message: string };

export function Empty(): CommandResponse {
    return { kind: "empty" };
}

export function Send(message: string): CommandResponse {
    return { kind: "send", message };
}

export function Reply(message: string): CommandResponse {
    return { kind: "reply", message };
}
