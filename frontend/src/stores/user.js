import { defineStore } from "pinia";

export const useUserStore = defineStore("currentUser", {
  state: () => ({
    name: "",
    role: "",
    birthday: "",
  }),
  actions: {
    setCurrentUser({ name, role, birthday }) {
      this.name = name;
      this.role = role;
      if (birthday) {
        this.birthday = birthday;
      }
    },
    setUserName(name) {
      this.name = name;
    },
    setBirthday(birthday) {
      this.birthday = birthday;
    },
  },
});
