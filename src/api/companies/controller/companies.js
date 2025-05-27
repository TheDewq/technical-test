export class Companies{
    static migrate(req, res){
        const {test} = req.body

        res.status(200).json({message: "funciono "+test})
    }
}