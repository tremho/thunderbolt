
const config = {
    main: 'main',
    pageList: 'main, next',


    // TODO: This bit can be generated.
    pages: {
        main: {page: require('./mainPage.riot').default, code: require('./mainPage')},
        next: {page: require('./nextPage.riot').default, code: require('./nextPage')}

    }
}
export default config


