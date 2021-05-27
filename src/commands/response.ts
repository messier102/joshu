// imagine having tagged unions natively in the language
// couldn't be TypeScript
type Message = { kind: "message"; message: string };

export type CommandResponse = Message;

export const CommandResponse = {
    Message(message: string): Message {
        return { kind: "message", message };
    },
};
