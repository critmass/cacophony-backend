const bcrypt = require("bcrypt")
const Membership = require("../../database_models/Membership")
const Post = require("../../database_models/Post")
const Role = require("../../database_models/Role")
const Room = require("../../database_models/Room")
const Server = require("../../database_models/Server")
const User = require("../../database_models/User")

const db = require("../../db")
const { createToken } = require("../../helpers/tokens")
const { resetDB } = require("../_resetDB")

const defaultImgURL = "https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg"
const defaultTime = new Date(2024, 10, 1, 12, 43, 55, 0)
const defaultColor1 = { r:255, b:255, g:0   }
const defaultColor2 = { r:0,   b:0,   g:255 }

const commonBeforeAll = async () => {

    await resetDB()

    await User.create({
        username:"user1",
        password:"password1",
        pictureUrl:defaultImgURL
    }) //ID:1
    await User.create({
        username:"user2",
        password:"password1",
        pictureUrl:defaultImgURL
    }) //ID:2
    await User.create({
        username:"user3",
        password:"password1",
        pictureUrl:defaultImgURL,
        isSiteAdmin:true
    }) //ID:3
    await User.create({
        username:"user4",
        password:"password1",
        pictureUrl:defaultImgURL,
        isSiteAdmin:false
    }) //ID:4
    await User.create({
        username:"user5",
        password:"password1",
        pictureUrl:defaultImgURL,
        isSiteAdmin:true
    }) //ID:5

    await Server.create({name:"server1", pictureUrl:defaultImgURL}) //ID:1
    await Server.create({name:"server2", pictureUrl:defaultImgURL}) //ID:2
    await Server.create({name:"server3", pictureUrl:defaultImgURL}) //ID:3

    await Room.create({name:"room11", serverId:1}) //ID:1
    await Room.create({name:"room12", serverId:1}) //ID:2
    await Room.create({name:"room21", serverId:2}) //ID:3
    await Room.create({name:"room22", serverId:2}) //ID:4
    await Room.create({name:"room31", serverId:3}) //ID:5
    await Room.create({name:"room32", serverId:3}) //ID:6
    await Room.create({name:"room13", serverId:1}) //ID:7

    /** ID:1 */
    await Role.create({
        title:"role1a",
        serverId:1,
        color:defaultColor1,
        isAdmin:true
    })
    /** ID:2 */
    await Role.create({
        title:"role1m",
        serverId:1,
        color:defaultColor2,
        isAdmin:false
    })
    /** ID:3 */
    await Role.create({
        title:"role2a",
        serverId:2,
        color:defaultColor1,
        isAdmin:true
    })
    /** ID:4 */
    await Role.create({
        title:"role2m",
        serverId:2,
        color:defaultColor2,
        isAdmin:false
    })
    /** ID:5 */
    await Role.create({
        title:"role3a",
        serverId:3,
        color:defaultColor1,
        isAdmin:true
    })
    /** ID:6 */
    await Role.create({
        title:"role3m",
        serverId:3,
        color:defaultColor2,
        isAdmin:false
    })
    /** ID:7 */
    await Role.create({
        title:"role to be deleted",
        serverId:1,
        color:defaultColor1,
        isAdmin:false
    })

    await Role.addAccess(1, 1, true ) //ID:1
    await Role.addAccess(1, 2, true ) //ID:2
    await Role.addAccess(2, 1, false) //ID:3
    await Role.addAccess(2, 2, false) //ID:4

    /* ID:1 */
    await Membership.create({
        userId:1,
        roleId:1,
        serverId:1,
        nickname:"Member1.1.1",
        pictureUrl:defaultImgURL
    })
    /* ID:2 */
    await Membership.create({
        userId:2,
        roleId:2,
        serverId:1,
        nickname:"Member2.2.2",
        pictureUrl:defaultImgURL
    })
    /* ID:3 */
    await Membership.create({
        userId:3,
        roleId:2,
        serverId:1,
        nickname:"Member3.3.2",
        pictureUrl:defaultImgURL
    })
    /* ID:4 */
    await Membership.create({
        userId:1,
        roleId:4,
        serverId:2,
        nickname:"Member4.1.4",
        pictureUrl:defaultImgURL
    })
    /* ID:5 */
    await Membership.create({
        userId:2,
        roleId:3,
        serverId:2,
        nickname:"Member5.2.3",
        pictureUrl:defaultImgURL
    })
    /* ID:6 */
    await Membership.create({
        userId:3,
        roleId:4,
        serverId:2,
        nickname:"Member6.3.4",
        pictureUrl:defaultImgURL
    })
    /* ID:7 */
    await Membership.create({
        userId:1,
        roleId:6,
        serverId:3,
        nickname:"Member7.1.6",
        pictureUrl:defaultImgURL
    })
    /* ID:8 */
    await Membership.create({
        userId:2,
        roleId:6,
        serverId:3,
        nickname:"Member8.2.6",
        pictureUrl:defaultImgURL
    })
    /* ID:9 */
    await Membership.create({
        userId:3,
        roleId:5,
        serverId:3,
        nickname:"Member9.3.5",
        pictureUrl:defaultImgURL
    })

    await Post.create({memberId:1, roomId:1, content:"post 1"}) //ID:1
    await Post.create({memberId:2, roomId:1, content:"post 2"}) //ID:2
    await Post.create({memberId:3, roomId:1, content:"post 3"}) //ID:3

}

const commonBeforeEach = async () => {
    await db.query("BEGIN")
}

const commonAfterEach = async () => {
    await db.query("ROLLBACK")
}

const commonAfterAll = async () => {
    await db.end()
}

const user1Token = createToken({
    id:1,
    username:"user1",
    is_site_admin:false,
    memberships:[
        {
            id:1,
            role_id:1,
            server_id:1,
            is_admin:true
        },
        {
            id:8,
            role_id:6,
            server_id:3,
            is_admin:false
        },
        {
            id:4,
            role_id:4,
            server_id:2,
            is_admin:false
        }
    ]
})
const user2Token = createToken({
    id:2,
    username:"user2",
    is_site_admin:false,
    memberships:[
        {
            id:2,
            role_id:2,
            server_id:1,
            is_admin:false
        },
        {
            id:7,
            role_id:6,
            server_id:3,
            is_admin:false
        },
        {
            id:5,
            role_id:3,
            server_id:2,
            is_admin:true
        }
    ]
})
const user3Token = createToken({
    id:3,
    username:"user3",
    is_site_admin:true,
    memberships:[
        {
            id:3,
            role_id:2,
            server_id:1,
            is_admin:false
        },
        {
            id:8,
            role_id:5,
            server_id:3,
            is_admin:true
        },
        {
            id:5,
            role_id:3,
            server_id:2,
            is_admin:false
        }
    ]
})
const user4Token = createToken({
    id:4,
    username:"user4",
    is_site_admin:false,
    memberships:[]
})
const user5Token = createToken({
    id:5,
    username:"user5",
    is_site_admin:true,
    memberships:[]
})

module.exports = {
    commonAfterAll, commonAfterEach, commonBeforeAll, commonBeforeEach,
    defaultTime, defaultImgURL,   defaultColor1,   defaultColor2,
    user1Token, user2Token, user3Token, user4Token, user5Token
}