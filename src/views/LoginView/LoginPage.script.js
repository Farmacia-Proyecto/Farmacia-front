import auth from "../../logic/auth";
export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      error: false,
    };
  },
  mounted(){
    this.logOut();
  },
  methods: {
    async login() {
      try {
        const response = await auth.login(this.email, this.password);
        document.cookie = `jwt=${response}; path=/; secure; samesite=strict`;
        this.$router.push("/admin");
      } catch (error) {
        console.log(error);
        this.error = true;
      }
    },
    goToRecovery() {
      this.$router.push("/recovery");
    },
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    },
  },
};
