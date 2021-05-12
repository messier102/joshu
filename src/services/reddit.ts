import RedditClient from "snoots";
import config from "../../data/config";

export const reddit = new RedditClient(config.reddit.client);
