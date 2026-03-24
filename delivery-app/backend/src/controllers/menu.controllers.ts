import { Request, Response } from 'express'
import {
    CreateMenuInput,
    UpdateMenuInput,
    DeleteMenuInput,
    GetMenuInput,
    GetMenusInput,
} from '../utils/types'
import {
    createMenuService,
    updateMenuService,
    deleteMenuService,
    getMenuService,
    getMenusService,
} from '../services/menu.service'

export const handleCreateMenuRequest = async (
    req: Request<{}, {}, CreateMenuInput['body']>,
    res: Response
) => {
    try {
        const menu = await createMenuService(req.body)
        return res.status(201).send(menu)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleUpdateMenuRequest = async (
    req: Request<{}, {}, UpdateMenuInput['body']>,
    res: Response
) => {
    try {
        const menu = await updateMenuService(req.body)
        return res.status(200).send(menu)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleDeleteMenuRequest = async (
    req: Request<DeleteMenuInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const menu = await deleteMenuService(req.params)
        return res.status(200).send(menu)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleGetMenuRequest = async (
    req: Request<GetMenuInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const menu = await getMenuService(req.params)
        return res.status(200).send(menu)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleGetMenusRequest = async (
    req: Request<GetMenusInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const menus = await getMenusService(req.params)
        return res.status(200).send(menus)
    } catch (e) {
        return res.status(400).send(e)
    }
}
