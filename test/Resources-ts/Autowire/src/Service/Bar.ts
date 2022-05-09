import IBar from "../Interface/IBar";

export default class Bar implements IBar {
    async process(): Promise<number> {
        return 10;
    }
}