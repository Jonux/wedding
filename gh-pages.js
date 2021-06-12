var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/Jonux/wedding.git',  
        user: {
            name: 'Jonux'
       }
    },
    () => {
        console.log('Deploy Complete!')
    }
)

