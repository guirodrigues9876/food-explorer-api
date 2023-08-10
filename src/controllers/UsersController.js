const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const knex = require("../database/knex");


class UsersController {
    async create(request, response){
        const { name, email, password, isAdmin } = request.body;

        if(!name || !email || !password){
            throw new AppError("Preencha todos os campos");
        };

        const checkUserExist =  await knex("users").where({ email }).first();

        if(checkUserExist){
            throw new AppError("Este e-mail já está em uso");
        }


        const hashedPassword = await hash(password, 8);

        await knex('users').insert({
            name,
            email,
            password: hashedPassword,
            isAdmin: isAdmin ? 1 : 0,
        });

        return response.status(201).json();

    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const user_id = request.user.id;


        const user = await knex("users").where({ id: user_id }).first();
        
        if(!user){
            throw new Error("Usuário não encontrado");
        }

        let userWithUpdateEmail;

        if(email){
            userWithUpdateEmail = await knex("users").where({ email }).first();
        } else {
            userWithUpdateEmail = await knex("users").where({ email: user.email }).first();
        }

        if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id){
            throw new AppError("Este email já está em uso");
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

        await knex("users").update({
            name: user.name,
            email: user.email,
            password: user.password,
            updated: knex.fn.now()
        }).where({ id: user.id});

        return response.status(200).json();
    }
}

module.exports = UsersController;