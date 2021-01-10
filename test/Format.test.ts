import Tap from 'tap'

import Formatter from '../src/general/Formatter'


function formatTest() {
    Tap.test('format', t => {
        t.ok(Formatter, 'there is a Formatter object')
        t.ok(typeof Formatter.format === 'function', 'there is a format function')
        let a = 'rain', b= 'Spain', c = 'plain'
        let f = 'the $1 in $2 is mainly in the $3'
        let r = Formatter.format(f, a, b, c)
        let x = 'the rain in Spain is mainly in the plain'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        // all the examples from Formatter.ts
        r = Formatter.format("Pi to 3 digits is $[1.3]", Math.PI)
        x = 'Pi to 3 digits is 3.142'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        let aString = "Now is the time for all good men to come to the aid of their country"
        r = Formatter.format("This string is a padded minimum of 10 and max 20 characters $[10,20]", aString)
        x = 'This string is a padded minimum of 10 and max 20 characters Now is the time for '
        t.ok(r === x, `expected "${x}", got "${r}"`)

        aString = "Now"
        r = Formatter.format("This string is a padded minimum of 10 and max 20 characters $[10,20]", aString)
        x = 'This string is a padded minimum of 10 and max 20 characters Now       '
        t.ok(r === x, `expected "${x}", got "${r}"`)
        r = Formatter.format("This string is right to 10 characters from here:$[ 10,]", aString)
        x = 'This string is right to 10 characters from here:       Now'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = Formatter.format("This is padded $[>10,10<]", "Hello")
        x = 'This is padded >>Hello<<<'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        // from format/Formatter.ts
        r = Formatter.format("The $1 jumped over the $2", "cow", "moon");
        x = 'The cow jumped over the moon'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = Formatter.format("We are putting the $2 before the $1 with this one", "horse", "cart");
        x = 'We are putting the cart before the horse with this one'
        t.ok(r === x, `expected "${x}", got "${r}"`)

        r = Formatter.format("The ${dish} ran away with the ${spoon}",{dish: "platter", spoon: "spatula"});
        x = 'The platter ran away with the spatula'
        t.ok(r === x, `expected "${x}", got "${r}"`)
        do {
            let a = {
                    individual: "man",
                    foo: "not important",
                    bar: "never mind"
                },
                b = {
                    fruit: "apple",
                    color: "blue",
                    group: "mankind"
                }
            r = Formatter.format("One small step for a $1{individual}, one giant leap for $2{group}", a, b);
            x = 'One small step for a man, one giant leap for mankind'
            t.ok(r === x, `expected "${x}", got "${r}"`)
        } while(false)
        do {
            let name = 'Dr. Victor Frankenstein'
            let addr = '1122 BoogieWoogie Ave.'
            let state = 'NJ'
            r = Formatter.format("Name: $1[20,20] Address: $2[ 60,60 ] State: $3[2,2]", name, addr, state);
            x = 'Name: Dr. Victor Frankenst Address:                    1122 BoogieWoogie Ave.                    State: NJ'
            t.ok(r === x, `expected "${x}", got "${r}"`)
        } while(false)
        do {
            r = Formatter.format("The value of PI to 6 places is $[1.6]", Math.PI);
            x = "The value of PI to 6 places is 3.141593"
            t.ok(r === x, `expected "${x}", got "${r}"`)
        } while(false)

        t.end()
    })
}

formatTest()




