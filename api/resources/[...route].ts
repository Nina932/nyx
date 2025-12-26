import employeeIndex from '../_controllers/resources/employees/index';
import employeeDetail from '../_controllers/resources/employees/detail';
import roleIndex from '../_controllers/resources/roles/index';
import roleDetail from '../_controllers/resources/roles/detail';
import policyIndex from '../_controllers/resources/policies/index';
import policyDetail from '../_controllers/resources/policies/detail';

export default async function handler(req: any, res: any) {
    const { route } = req.query;
    // route is an array: ['employees'] or ['employees', '123']

    const resource = route[0];
    const id = route[1];

    if (resource === 'employees') {
        if (id) return employeeDetail(req, res, id);
        return employeeIndex(req, res);
    }

    if (resource === 'roles') {
        if (id) return roleDetail(req, res, id);
        return roleIndex(req, res);
    }

    if (resource === 'policies') {
        if (id) return policyDetail(req, res, id);
        return policyIndex(req, res);
    }

    return res.status(404).json({ error: 'Resource route not found' });
}
