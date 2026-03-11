import { RoleBrand } from '../decorator/role-brand.decorator';
import {
  AccessDetails,
  BrandRole,
  IAptrack2EmployeeMetaData,
  TopAccessItem,
} from '../entities/user-metadata.entity';
import { UserRole } from '../entities/userRole.entity';
import { AptrackProconnectIntegratedRoles, AptrackRole } from '../enum/aptrack-role.enum';
import { Role } from '../enum/role.enum';

export function brandRoleFormat(userRole: UserRole[]) {
  let brandRoleFormat: RoleBrand[] = [];

  for (const role of userRole) {
    brandRoleFormat.push({ brandId: role.brandId, role: role.role });
  }

  return brandRoleFormat;
}

export function getFacultyRoles(faculty: IAptrack2EmployeeMetaData) {
  const allRoles = faculty.brandIds.flatMap((brand) =>
    brand.RoleCentre.map((roleCentre) => roleCentre.Role),
  );

  return Array.from(
    new Set(
      allRoles.filter((role): role is AptrackRole =>
        Object.values(AptrackRole).includes(role as AptrackRole),
      ),
    ),
  );
}

export function getCeBrandId(brandIds: BrandRole[]) {
  return brandIds[0].BrandId;
}

export function allRolesArray(userRole: UserRole[]) {
  return userRole.map((role) => role.role);
}

export function simplifyBrandIdsForCE(brandIds: BrandRole[]) {
  type SimplifiedRole = {
    brandId: number;
    role: string;
    centreIds: number[];
    centreHierarchy: {
      Zone: string;
      Region: string;
      Area: string;
      CentreId: number;
      CentreName: string;
    }[];
  };

  const simplifyCEBrandIds: SimplifiedRole[] = [];

  for (const brand of brandIds) {
    for (const role of brand.RoleCentre) {
      if (Object.values(AptrackRole).includes(role.Role as AptrackRole)) {
        simplifyCEBrandIds.push({
          brandId: brand.BrandId,
          role: AptrackProconnectIntegratedRoles[role.Role],
          centreIds: role.CentreDetails.map((c) => c.CentreId),
          centreHierarchy: role.CentreDetails.map((c) => {
            return {
              Zone: c.Zone,
              Region: c.Region,
              Area: c.Area,
              CentreId: c.CentreId,
              CentreName: c.CentreName,
            };
          }),
        });
      }
    }
  }

  // combine center ids for same role and same brand

  const result: SimplifiedRole[] = [];

  for (const item of simplifyCEBrandIds) {
    const existing = result.find(
      (r) => r.brandId === item.brandId && r.role === item.role,
    );

    if (existing) {
      existing.centreHierarchy = [
        ...new Map(
          [...existing.centreHierarchy, ...item.centreHierarchy].map((h) => [
            h.CentreId,
            h,
          ]),
        ).values(),
      ];
    } else {
      result.push({
        brandId: item.brandId,
        role: item.role,
        centreIds: [...item.centreIds],
        centreHierarchy: [...item.centreHierarchy],
      });
    }
  }

  return result;
}

/* AE */
export function getAeBrandId(topAccess: TopAccessItem[]) {
  return topAccess[0].BrandId;
}

export function getAeRoles(faculty: IAptrack2EmployeeMetaData) {
  const allRoles = faculty.TopAccess.flatMap((brand) =>
    brand.RoleAcess.map((roleAccess) => roleAccess.Role),
  );

  return Array.from(
    new Set(
      allRoles.filter((role): role is AptrackRole =>
        Object.values(AptrackRole).includes(role as AptrackRole),
      ),
    ),
  );
}

export function simplifyTopAccessForAE(topAccess: TopAccessItem[]) {
  type Role = {
    brandId: number;
    role: string;
    hierarchy: AccessDetails[];
  };

  const simplifyCEBrandIds: Role[] = [];

  for (const brand of topAccess) {
    for (const role of brand.RoleAcess) {
      if (Object.values(AptrackRole).includes(role.Role as AptrackRole)) {
        simplifyCEBrandIds.push({
          brandId: brand.BrandId,
          role: AptrackProconnectIntegratedRoles[role.Role],
          hierarchy: role.AcessDetails,
        });
      }
    }
  }

  return simplifyCEBrandIds;
}
/* AE */
