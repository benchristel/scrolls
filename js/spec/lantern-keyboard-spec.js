describe('pressing a key', function() {
    it('fires an event on the Lantern object', function() {
        var pass = false;

        $.whenKeyPressed(function() {
            pass = true
        })

        $.fireEvent('KeyPressed')

        expect(pass).toBe(true)
    })
})
