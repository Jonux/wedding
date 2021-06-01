var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/Jonux/wedding.git',  
        user: {
            name: 'Joel Huttunen',
            email: 'joel-github@md5.fi'
       }
    },
    () => {
        console.log('Deploy Complete!')
    }
)

