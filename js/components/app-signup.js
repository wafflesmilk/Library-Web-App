const SignUp = {
    template:`
    <v-card class="mt-10 m-5 bg-light-blue-lighten-3" elevation="4">
        <v-card-title class="text-center">Sign Up</v-card-title>
        <v-container class="bg-white" fluid>
            <v-form ref="form" class="mx-5 my-4" >
                <v-text-field class="my-1" v-model="username" label="Username" :rules="requiredRule" ></v-text-field>
                <v-text-field 
                    class="my-1" 
                    v-model="password" label="Create Password" 
                    :rules="[...requiredRule, ...pwRule]"
                    :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show ? 'text' : 'password'"
                    @click:append-inner="show = !show">
                </v-text-field>
                <v-text-field type="password" class="my-1" v-model="confirm_pw" label="Re-enter Password" :rules="[...requiredRule, ...matchRule]"></v-text-field>
                <div class="d-flex justify-center mt-4">
                <v-btn elevation="4" @click="signUp">Submit</v-btn>
                </div>
            </v-form>
            <v-alert v-if="msg == 'success'" type="success" title="Success" text="Successfully signed up." class="ma-2" :height="60"></v-alert>
            <v-alert v-else-if="msg && msg != 'success'" type="error" title="Error"class="ma-2" :height="60">{{msg}}</v-alert>
        </v-container>
    </v-card>
   
    `,
    data(){
        return{
            show:false,
            msg:'',
            username:'',
            password:'',
            confirm_pw: '',
            requiredRule:[v => !!v || "This field is required."],
            pwRule:[v => !!v && v.length >=6 ||  "Password must be at least 6 characters long."],
            matchRule:[v => v === this.password || "Passwords must match."]
        }
    },
    methods:{
        signUp(){
        if (this.$refs.form.validate()) {

            var self = this;
            const requestOptions = {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                username: self.username,
                password: self.password
                })
            }

            fetch('resources/apis.php/LibraryUsers/', requestOptions)
            .then( response =>{
            //turning the response into the usable data
            return response.json();
            })

            .then( data =>{
            self.msg = "success"  ;

            setTimeout(() => { //shows the success alert before redirecting user to home page 
                this.$emit("isAuthenticated", true);
                this.$emit("username", self.username);
                this.$router.replace({name: "home", params: { username: self.username }});
            }, 2000); // 2 seconds delay
            })

            .catch(error => {
                self.msg = "Username already exists. Please pick another one.";
            });	
        };
        }
    }
}