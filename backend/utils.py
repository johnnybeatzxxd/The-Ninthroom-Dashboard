"""
Utilities for converting Peewee model instances to plain dicts
suitable for Pydantic response validation.

Peewee's ForeignKeyField accessors return the related object by default,
not just the raw ID. This helper resolves FK fields to their string IDs.
"""
from peewee import Model, ForeignKeyField


def row_to_dict(instance) -> dict:
    """Convert a single Peewee model instance to a plain dict.
    ForeignKey fields are resolved to their raw ID values (as strings).
    """
    data = {}
    for field_name, field_obj in instance._meta.fields.items():
        if isinstance(field_obj, ForeignKeyField):
            # Access raw column value (e.g. model_id_id) to avoid loading the related object
            raw_id = getattr(instance, field_obj.column_name)
            data[field_name] = str(raw_id) if raw_id is not None else None
        else:
            value = getattr(instance, field_name)
            data[field_name] = value
    return data


def rows_to_list(query) -> list:
    """Convert a Peewee SELECT query to a list of plain dicts."""
    return [row_to_dict(row) for row in query]
