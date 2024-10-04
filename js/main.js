const { createApp } = Vue
const app = createApp()
const vuetify = Vuetify.createVuetify()   

// Creating the VueRouter

const router = VueRouter.createRouter({
	history: VueRouter.createWebHashHistory(), 
	routes: [
    {
        path:'/',
        redirect:'/login'
    },

	{
		path: '/user/:username/home',
		component: Home,
		name:"home"
	},

    
    {
        path: '/signup',
		component: SignUp,
		name:"signup"
    },
    {
        path: '/login',
		component: Login,
		name:"login"
    },

	{
		path: '/user/:username/read',
        component:Read,
		name:"read"
	},
	{
		path: '/user/:username/currently_reading',
		component: CurrentlyReading,
		name:  'currentlyreading'
	},
    {
		path: '/user/:username/to_read',
		component: ToRead,
		name:  'toread'
	}
  ]
})

app.component('app-main',{
    data(){
        return{
            drawer:false,
            isAuthenticated:false,
            username:'Guest'
        }
    },
    mounted() {
        if(!this.isAuthenticated) {
            this.$router.replace({ name: "login"});
        }},

    methods: {
        setAuthenticated(status) {
            this.isAuthenticated = status;

        },
        setUsername(username){
            this.username = username;
        },

        logout(){
            this.setUsername('Guest');
            this.setAuthenticated(false);
            this.$router.replace({ name: "login"});
        }
    },  


    template: `
    <v-app-bar color="light-blue-lighten-3">
    <v-app-bar-nav-icon icon="mdi-library-shelves" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title class="font-weight-bold">My Library</v-app-bar-title>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" temporary>
        <div class="d-flex flex-row mt-4 ml-3 mb-2 align-center">
        <div class="col-3 mr-4"><v-avatar><v-img src="images/guest.jpg"  alt="profile"></v-img></v-avatar></div>
        <div class="col-9 text-left font-weight-medium mt-2">{{username}}</div>
        </div>
        <v-list v-if="!isAuthenticated">
            <v-list-item prepend-icon="mdi-account-plus" value="signup" :to="{name:'signup'}" color="light-blue-darken-2">Sign Up
            </v-list-item>

            <v-list-item prepend-icon="mdi-login" value="login" :to="{name:'login'}" color="light-blue-darken-2">Login
            </v-list-item>
        </v-list>

        <v-list class="text-decoration-none"  v-if="isAuthenticated">  
       
        <v-list-item prepend-icon="mdi-home" value="home" :to="{name:'home', params: { username: username }}" color="light-blue-darken-2">Home
        </v-list-item>
        
        <v-list-item prepend-icon="mdi-bookmark-multiple"value="currently_reading" :to="{name: 'currentlyreading',params: { username: username }}" color="light-blue-darken-2">
        Currently Reading
        </v-list-item>
     
        <v-list-item prepend-icon="mdi-plus-box-multiple" value="read" :to="{name: 'read',params: { username: username }}" color="light-blue-darken-2" >
        Read
        </v-list-item>
      
        <v-list-item prepend-icon="mdi-book-heart" value="to_read" :to="{name: 'toread', params: { username: username }}" color="light-blue-darken-2">
        Want To Read
        </v-list-item>
        </v-list>

        <template v-slot:append v-if="isAuthenticated">
        <div class="pa-2">
            <v-btn block @click="logout()">Logout</v-btn>
        </div>
        </template>
        
        </v-navigation-drawer>
        <v-main class="ma-10">
            <router-view @isAuthenticated="setAuthenticated" @username="setUsername"></router-view>
        </v-main>

        <v-footer class="bg-light-blue-lighten-3 flex-grow-0 d-flex flex-column justify-center align-center">
            <p class="font-weight-bold text-h6 mt-2 mb-1">COS30043 - Software Interface and Design</p>
            <p class="font-weight-medium mb-1">Mia Leang</p>
            <p class="mb-1">104356422</p>
            <p class="mb-1">Swinburne University of Technology</p>
            <p class="mb-2"><v-icon icon="mdi-map-marker"></v-icon>Hawthorn VIC 3122</p>
        </v-footer>
    `
});

app.use(vuetify)
app.use(router)
app.mount('#app')
