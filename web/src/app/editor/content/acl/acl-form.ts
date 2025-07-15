/*
 * Copyright (C) 2019  Ľuboš Kozmon <https://www.elkozmon.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Acl, Permission, Scheme, ZNodeAcl, ZNodeMeta} from "../../../core";

export class AclForm {

  private aclForm: FormGroup;

  constructor(
    zNodeAcl: ZNodeAcl,
    zNodeMeta: ZNodeMeta,
    private formBuilder: FormBuilder
  ) {
    this.aclForm = this.newForm(zNodeAcl, zNodeMeta);
  }

  get form(): FormGroup {
    return this.aclForm;
  }

  get values(): Acl[] {
    const aclArray: Acl[] = [];
    const lastIndex = this.getAclLastIndex();

    for (let i = 0; i <= lastIndex; i++) {
      aclArray.push({
        scheme: this.getAclSchemeFormValue(i),
        id: this.getAclIdFormValue(i),
        permissions: this.getAclPermissionsFormValue(i)
      });
    }

    return aclArray;
  }

  get isDirty(): boolean {
    return this.aclForm.dirty;
  }

  get isValid(): boolean {
    return this.aclForm.valid && this.aclFormArray.controls.length > 0;
  }

  get aclVersion(): number {
    return this.aclForm.get("aclVersion").value;
  }

  get aclFormArray(): FormArray {
    return <FormArray>this.aclForm.get("aclArray");
  }

  clearAclFormArray(): void {
    const removeAll: () => void = () => {
      while (this.aclFormArray.controls.length > 0) {
        this.aclFormArray.removeAt(0);
      }
    };

    removeAll();

    this.addAclFormItem();
    this.aclForm.markAsDirty();
  }

  addAclFormItem(acl?: Acl): void {
    this.aclFormArray.push(this.newFormGroup(acl));
    this.aclForm.markAsDirty();
  }

  removeAclFormItem(index: number): void {
    this.aclFormArray.removeAt(index);
    this.aclForm.markAsDirty();
  }

  markAsPristine(): void {
    this.aclForm.markAsPristine();
  }

  private newForm(zNodeAcl: ZNodeAcl, zNodeMeta: ZNodeMeta): FormGroup {
    const aclGroups: FormGroup[] = [];

    zNodeAcl.forEach(acl => aclGroups.push(this.newFormGroup(acl)));

    return this.formBuilder.group({
      aclVersion: [zNodeMeta.aclVersion.toString(), [Validators.required]],
      aclArray: this.formBuilder.array(aclGroups),
      applyRecursive: [false]
    });
  }

  private newFormGroup(acl?: Acl): FormGroup {
    return this.formBuilder.group({
      scheme: [acl ? acl.scheme : "", [Validators.required]],
      id: [acl ? acl.id : ""],
      permissions: this.newPermissionFormGroup(acl ? acl.permissions : null)
    });
  }

  private newPermissionFormGroup(checked?: Permission[]): FormGroup {
    const isChecked: (Permission) => boolean = (permission) => {
      if (!checked) {
        return false;
      }

      return checked.indexOf(permission) !== -1;
    };

    return this.formBuilder.group({
      canCreate: [isChecked("create")],
      canRead: [isChecked("read")],
      canDelete: [isChecked("delete")],
      canWrite: [isChecked("write")],
      canAdmin: [isChecked("admin")]
    });
  }

  private getAclLastIndex(): number {
    return this.aclFormArray.controls.length - 1;
  }

  private getAclFormGroup(index: number): FormGroup {
    return <FormGroup>this.aclFormArray.at(index);
  }

  private getAclSchemeFormValue(index: number): Scheme {
    return this.getAclFormGroup(index).get("scheme").value;
  }

  private getAclIdFormValue(index: number): string {
    return this.getAclFormGroup(index).get("id").value;
  }

  private getAclPermissionsFormValue(index: number): Permission[] {
    const perms: Permission[] = [];

    const permsGroup = this.getAclFormGroup(index).get("permissions");

    if (permsGroup.get("canCreate").value) {
      perms.push("create");
    }

    if (permsGroup.get("canRead").value) {
      perms.push("read");
    }

    if (permsGroup.get("canDelete").value) {
      perms.push("delete");
    }

    if (permsGroup.get("canWrite").value) {
      perms.push("write");
    }

    if (permsGroup.get("canAdmin").value) {
      perms.push("admin");
    }

    return perms;
  }
}
