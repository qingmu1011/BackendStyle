import { useDark, useToggle } from "@vueuse/core";
import eventBus from "~/utils/eventBus";

export const isDark = useDark({

    onChanged(isDark){
        // 修改主题
        document.documentElement.classList.toggle("dark", isDark);
        // 发送事件
        eventBus.emit("changeTheme", isDark);
    }
});
export const toggleDark = useToggle(isDark);