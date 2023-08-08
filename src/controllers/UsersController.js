const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const UserRespository  = require("../repositories/UserRespository");
const sqliteConnection = require("../database/sqlite");

class UsersController {
    async create(request, response){
        const { name, email, password } = request.body;

        const userRespository = new UserRespository();

        const checkUserExist = await userRespository.findByEmail(email);
        if(checkUserExist){
            throw new AppError("Este email já está em uso.");
        }

        const hashedPassword = await hash(password, 8);

        await userRespository.create({ name, email, password: hashedPassword });

        return response.status(201).json();

    }

    async update(request, response){
        const { name, email, password, old_password } = request.body;
        const user_id = request.user.id;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [ user_id ]);

        if(!user){
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdateEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(userWithUpdateEmail && userWithUpdateEmail.id !== user_id){
            throw new AppError("Este e-mail já está em uso.");
        }

        user.nome = name ?? user.nome;
        user.email = email ?? user.email;

        if(password && !old_password){
            throw new AppError("Você precisa informar a senha antiga")
        }

        if(password && old_password){
            const checkOldPassword = await compare(old_password, user.password);

            if(!checkOldPassword){
                throw new AppError("A senha antiga não confere.");
            }

            user.password = await hash(password, 8);
        }

        await database.run(`
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.nome, user.email, user.password, user_id]
        );

        return response.status(200).json();

    }
}

module.exports = UsersController;