// imagine having tagged unions natively in the language
// couldn't be TypeScript

type Empty = { kind: "empty" };
type Send = { kind: "send"; message: string };
type Reply = { kind: "reply"; message: string };

export type CommandResponse = Empty | Send | Reply;

export const CommandResponse = {
    Empty(): Empty {
        return { kind: "empty" };
    },

    Send(message: string): Send {
        return { kind: "send", message };
    },

    Reply(message: string): Reply {
        return { kind: "reply", message };
    },
};
