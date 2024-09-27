import Adapter from "../Adapter";

export default class CiAdapter implements Adapter {
    toString(): string {
        return 'ci';
    }
}