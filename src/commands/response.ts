// imagine having tagged unions natively in the language
// couldn't be TypeScript

type Empty = { kind: "empty" };
type Message = { kind: "message"; message: string };

export type CommandResponse = Empty | Message;

export const CommandResponse = {
    Empty(): Empty {
        return { kind: "empty" };
    },

    Message(message: string): Message {
        return { kind: "message", message };
    },
};
