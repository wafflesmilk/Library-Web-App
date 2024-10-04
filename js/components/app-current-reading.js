const CurrentlyReading = {
    template:`
   <v-container fluid class="currently-reading">
   <div v-if="myBooks.length == 0">
        <p class="font-italic text-center text-body d-flex flex-column justify-center">No books here at the moment! Head to the home page to add books.</p>
   </div>
    <v-row v-else class="justify-start align-center">
        <v-col v-for="item in getItems" :key="item" lg="2" md="3" sm="4" class="my-lg-3">
        <v-card 
            hover 
            :width="150" 
            :height="330" 
            :rounded="0"
        >
        <v-img 
            :src="'https://covers.openlibrary.org/b/id/' + item.img + '-L.jpg'" 
            cover 
            :width="150" 
            :height="220"
        >
        </v-img>

        <v-card-text class="text-wrap text-center text-subtitle-2 text-truncate black mx-1 mt-1 pa-0">{{ item.bookTitle }}</v-card-text>
        <v-card-text class="text-center text-caption text-truncate grey-lighten-1 mb-2 mx-1 mt-0 pa-0">{{ item.author}}</v-card-text>
        <div class="d-flex flex-column justify-center">
            <v-progress-linear height="18" class="ml-2" v-model="item.progress" color="light-blue-lighten-2">
                {{ Math.ceil(item.progress) }}%
            </v-progress-linear>
            <input v-if="modifyProgress" class="ma-2 border-sm" v-model="item.progress" type="number" min="item.progress" max="100" @keyup.enter="UpdateProgress(item)">
            <v-btn size="small" class="justify-center align-center ma-2" v-if="!modifyProgress">Edit
            <v-menu activator="parent" transition="slide-y-transition" bottom>
                <v-list>
                <v-list-item @click="modifyProgress = true">Update</v-list-item>
                <v-list-item @click="Finished(item)">Finished</v-list-item>
                <v-list-item @click="Remove(item)">Remove</v-list-item>
                </v-list>
            </v-menu>
            </v-btn>
        </div>
        </v-card>
        </v-col>
    </v-row>

    <div class="align-center mt-4">
        <v-pagination 
        v-if="myBooks.length > 0" 
        class="m-2"
        v-model="currentPage"
        :length="getPageCount"
        :total-visible="4">
        </v-pagination>
    </div>
   </v-container>
    `,

    data(){
        return{
            myBooks : [],
            perPage : 18,
            currentPage :  1,
            modifyProgress : false
        }
    },

    methods:{
        getBooks() {
            const username = this.$route.params.username;
            fetch(`resources/apis.php/user_books/username/${username}/type/currently-reading`)
            .then(response => response.json())
            .then(data => {
                this.getBookDetails(data);
            })
            .catch(error => {
                alert('Failed to retrieve books. ' + error);
            });
        },
        getBookDetails(books) {
            books.forEach(book => {
                fetch(`resources/apis.php/books/bookID/${book.bookID}`)
                .then(response => response.json())
                .then(bookDetails => {
                    // Merge fields from getBooks() and getBookDetails() to retain the 'progress' field
                    const mergedBook = {
                        ...book,
                        ...bookDetails[0]
                    };
        
                    this.myBooks.push(mergedBook);
                })
                .catch(error => {
                    alert('Failed to retrieve book details: ' + error);
                });
            });
        },
        
        Remove(book) {
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
           
            fetch(`resources/apis.php/user_books/bookID/${book.bookID}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    this.myBooks = this.myBooks.filter(item => item.bookID !== book.bookID); //removing book from current array updates page layout
                })
                .catch(error => {
                    alert('Could not remove book. ' + error);
                });
        },

        UpdateProgress(book) {
            this.modifyProgress = false;
            const username = this.$route.params.username;
            fetch(`resources/apis.php/user_books/username/${username}/bookID/${book.bookID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    progress: book.progress
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Progress updated successfully.')
                   progress = book.progress;
                })
                .catch(error => {
                    alert('Failed to update progress. ' + error);
                });
        },

        Finished(book){
            fetch(`resources/apis.php/user_books/bookID/${book.bookID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type:'read'
                })
            })
                .then(response => response.json())
                .then(data => {
                    this.myBooks = this.myBooks.filter(item => item.bookID !== book.bookID);
                })
                .catch(error => {
                    alert('Failed to update book type. ' + error);
                });
        }
    },

    computed:{
        //pagination
        getItems() {
            let start = (this.currentPage - 1) * this.perPage;
            let end = start + this.perPage;
            return this.myBooks.slice(start, end);
        },
        getPageCount() {
        return Math.ceil(this.myBooks.length / this.perPage);
        }
    },
   
    mounted(){
        this.getBooks();
    }

};
