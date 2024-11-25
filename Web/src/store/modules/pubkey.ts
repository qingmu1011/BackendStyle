import { defineStore } from "pinia";
import { getPubkey } from "~/api/common/pubkey";
import { store } from "~/store";
const state = {
    pubkey: "",
};

const usePubkeyStore = defineStore({
    id: "imcreator-pubkey",
    state: () => state,
    actions: {
        /** 存储公钥 */
        SET_PUBKEY(key: string) {
            this.pubkey = key;
        },
        /** 刷新pubkey */
        async refreshPubkey() {
            return new Promise<any>((resolve, reject) => {
                getPubkey()
                    .then((res) => {
                        this.SET_PUBKEY(res.content);
                        resolve(res);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
    },
});

export default usePubkeyStore;

export function usePubkeyStoreHook() {
    return usePubkeyStore(store);
}